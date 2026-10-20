package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.AirplaneDTO;
import com.transfer.fasticket.dto.AirplaneResponseDTO;
import com.transfer.fasticket.models.*;
import com.transfer.fasticket.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AirplaneService {
    private static final Logger logger = LoggerFactory.getLogger(AirplaneService.class);

    private final AirplaneRepository airplaneRepository;
    private final BrandRepository brandRepository;
    private final AirlineRepository airlineRepository;
    private final CabinStructureRepository cabinStructureRepository;
    private final ServiceClassRepository serviceClassRepository;
    private final SeatStructureRepository seatStructureRepository;
    private final FlightRepository flightRepository;

    @Autowired
    public AirplaneService(AirplaneRepository airplaneRepository,
            BrandRepository brandRepository,
            AirlineRepository airlineRepository,
            CabinStructureRepository cabinStructureRepository,
            ServiceClassRepository serviceClassRepository,
            SeatStructureRepository seatStructureRepository,
            FlightRepository flightRepository) {
        this.airplaneRepository = airplaneRepository;
        this.brandRepository = brandRepository;
        this.airlineRepository = airlineRepository;
        this.cabinStructureRepository = cabinStructureRepository;
        this.serviceClassRepository = serviceClassRepository;
        this.seatStructureRepository = seatStructureRepository;
        this.flightRepository = flightRepository;
    }

    @Transactional
    public AirplaneResponseDTO addAirplane(AirplaneDTO airplaneDTO) {
        // Проверка уникальности: у авиакомпании не может быть одной и той же модели
        // одной и той же марки
        Brand brand = brandRepository.findById(airplaneDTO.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found: " + airplaneDTO.getBrandId()));
        Integer airlineId = brand.getAirlineId();
        List<Airplane> existing = airplaneRepository.findByModelAndBrandIdAndAirlineId(
                airplaneDTO.getModel(), airplaneDTO.getBrandId(), airlineId);
        if (!existing.isEmpty()) {
            throw new RuntimeException("У этой авиакомпании уже есть самолёт этой марки и модели");
        }
        // Создаем самолет
        Airplane airplane = new Airplane();
        airplane.setBrandId(airplaneDTO.getBrandId());
        airplane.setModel(airplaneDTO.getModel());
        airplane.setRange(airplaneDTO.getRange());
        airplane.setNumberOfPassages(airplaneDTO.getNumberOfPassages());
        Airplane savedAirplane = airplaneRepository.save(airplane);

        // Создаём CabinStructure для каждого класса обслуживания
        if (airplaneDTO.getCabinStructures() != null) {
            int currentRow=0;
            for (AirplaneDTO.CabinStructureDTO csDto : airplaneDTO.getCabinStructures()) {
                // Найти serviceClassId по имени класса
                Integer serviceClassId = serviceClassRepository.findByName(csDto.getServiceClass())
                        .map(ServiceClass::getServiceClassId)
                        .orElseThrow(() -> new RuntimeException("Service class not found: " + csDto.getServiceClass()));

                CabinStructure cs = new CabinStructure();
                cs.setAirplaneId(savedAirplane.getAirplaneId());
                cs.setServiceClassId(serviceClassId);
                cs.setNumberOfRows(csDto.getNumberOfRows());
                cs.setNumberOfSeatsPerRow(csDto.getNumberOfSeatsPerRow());
                CabinStructure savedCabin = cabinStructureRepository.save(cs);

                // Генерируем места (SeatStructure) для каждого ряда и места (A, B, ...)
                for (int row = 1; row <= csDto.getNumberOfRows(); row++) {
                    currentRow++;
                    for (int seat = 0; seat < csDto.getNumberOfSeatsPerRow(); seat++) {
                        SeatStructure seatStructure = new SeatStructure();
                        seatStructure.setCabinStructureId(savedCabin.getCabinStructureId());
                        seatStructure.setRow(currentRow);
                        seatStructure.setSeat(String.valueOf((char) ('A' + seat)));
                        seatStructureRepository.save(seatStructure); // Раскомментировать если нужно
                        // сохранять места
                    }
                }
            }
        }

        return convertToResponseDTO(savedAirplane);
    }

    @Transactional
    public AirplaneResponseDTO addAirplaneById(AirplaneDTO airplaneDTO) {
        // Проверка уникальности: у авиакомпании не может быть одной и той же модели
        // одной и той же марки
        Brand brand = brandRepository.findById(airplaneDTO.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found: " + airplaneDTO.getBrandId()));
        Integer airlineId = brand.getAirlineId();
        List<Airplane> existing = airplaneRepository.findByModelAndBrandIdAndAirlineId(
                airplaneDTO.getModel(), airplaneDTO.getBrandId(), airlineId);
        if (!existing.isEmpty()) {
            throw new RuntimeException("У этой авиакомпании уже есть самолёт этой марки и модели");
        }
        // Создаем самолет
        Airplane airplane = new Airplane();
        airplane.setAirplaneId(airplaneDTO.getAirplaneId());
        airplane.setBrandId(airplaneDTO.getBrandId());
        airplane.setModel(airplaneDTO.getModel());
        airplane.setRange(airplaneDTO.getRange());
        airplane.setNumberOfPassages(airplaneDTO.getNumberOfPassages());
        //Airplane savedAirplane = airplaneRepository.save(airplane);
        airplaneRepository.insertById(
                airplane.getAirplaneId(),
                airplane.getBrandId(),
                airplane.getModel(),
                airplane.getRange(),
                airplane.getNumberOfPassages()
        );

        // Создаём CabinStructure для каждого класса обслуживания
        if (airplaneDTO.getCabinStructures() != null) {
            int currentRow=0;
            for (AirplaneDTO.CabinStructureDTO csDto : airplaneDTO.getCabinStructures()) {
                // Найти serviceClassId по имени класса
                Integer serviceClassId = serviceClassRepository.findByName(csDto.getServiceClass())
                        .map(ServiceClass::getServiceClassId)
                        .orElseThrow(() -> new RuntimeException("Service class not found: " + csDto.getServiceClass()));

                CabinStructure cs = new CabinStructure();
                cs.setAirplaneId(airplane.getAirplaneId());
                cs.setServiceClassId(serviceClassId);
                cs.setNumberOfRows(csDto.getNumberOfRows());
                cs.setNumberOfSeatsPerRow(csDto.getNumberOfSeatsPerRow());
                CabinStructure savedCabin = cabinStructureRepository.save(cs);

                // Генерируем места (SeatStructure) для каждого ряда и места (A, B, ...)
                for (int row = 1; row <= csDto.getNumberOfRows(); row++) {
                    currentRow++;
                    for (int seat = 0; seat < csDto.getNumberOfSeatsPerRow(); seat++) {
                        SeatStructure seatStructure = new SeatStructure();
                        seatStructure.setCabinStructureId(savedCabin.getCabinStructureId());
                        seatStructure.setRow(currentRow);
                        seatStructure.setSeat(String.valueOf((char) ('A' + seat)));
                        seatStructureRepository.save(seatStructure); // Раскомментировать если нужно
                        // сохранять места
                    }
                }
            }
        }

        return convertToResponseDTO(airplane);
    }

    @Transactional
    public AirplaneResponseDTO editAirplane(AirplaneDTO airplaneDTO){
        deleteAirplane(airplaneDTO.getAirplaneId());
        return addAirplaneById(airplaneDTO);
    }

    @Transactional(readOnly = true)
    public List<AirplaneResponseDTO> getAllAirplanes() {
        List<Airplane> airplanes = (List<Airplane>) airplaneRepository.findAll();
        logger.info("Found {} airplanes", airplanes.size());
        return airplanes.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AirplaneResponseDTO> searchAirplanes(String model, String brand, String airline) {
        List<Airplane> airplanes = airplaneRepository.findByModelBrandAndAirline(
                model != null ? model : "",
                brand != null ? brand : "",
                airline != null ? airline : "");

        return airplanes.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAirplane(Integer airplaneId) {
        // Проверка: используется ли самолёт в рейсах
        List<Flight> flights = flightRepository.findByAirplaneId(airplaneId);
        if (!flights.isEmpty()) {
            // Собираем номера рейсов
            List<String> flightNumbers = new ArrayList<>();
            for (Flight f : flights) {
                flightNumbers.add(f.getFlightNumber());
            }
            throw new RuntimeException("Самолёт используется в рейсах: " + String.join(", ", flightNumbers));
        }
        // Если самолёт не найден — явно выбрасываем NOT_FOUND
        if (!airplaneRepository.existsById(airplaneId)) {
            throw new RuntimeException("NOT_FOUND");
        }
        // Удаляем сначала структуры салона
        cabinStructureRepository.deleteByAirplaneId(airplaneId);
        // Затем самолет
        airplaneRepository.deleteById(airplaneId);
    }

    @Transactional(readOnly = true)
    public List<String> getAllAirplaneModels() {
        List<Airplane> airplanes = (List<Airplane>) airplaneRepository.findAll();
        return airplanes.stream()
                .map(airplane -> String.valueOf(airplane.getModel()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AirplaneDTO> getAirplanesByBrandId(Integer brandId) {
        List<AirplaneDTO> airplanes = new ArrayList<>();
        airplaneRepository.findByBrandId(brandId).forEach(airplane -> {
            AirplaneDTO dto = new AirplaneDTO();
            dto.setAirplaneId(airplane.getAirplaneId());
            dto.setBrandId(airplane.getBrandId());
            dto.setModel(airplane.getModel());
            dto.setRange(airplane.getRange());
            dto.setNumberOfPassages(airplane.getNumberOfPassages());
            airplanes.add(dto);
        });
        return airplanes;
    }

    public AirplaneResponseDTO getAirplaneById(Integer airplaneId) {
        Airplane airplane = airplaneRepository.findById(airplaneId).orElse(null);
        if (airplane == null) {
            throw new RuntimeException("Airplane not found: " + airplaneId);
        }
        return convertToResponseDTO(airplane);
    }

    @Transactional(readOnly = true)
    public List<Flight> getFlightsByAirplaneId(Integer airplaneId) {
        return flightRepository.findByAirplaneId(airplaneId);
    }

    private AirplaneResponseDTO convertToResponseDTO(Airplane airplane) {
        AirplaneResponseDTO dto = new AirplaneResponseDTO();
        dto.setAirplaneId(airplane.getAirplaneId());
        dto.setBrandId(airplane.getBrandId());
        dto.setModel(airplane.getModel());
        dto.setRange(airplane.getRange());
        dto.setNumberOfPassages(airplane.getNumberOfPassages());

        // Get brand and airline information
        Brand brand = brandRepository.findById(airplane.getBrandId()).orElse(null);
        if (brand != null) {
            dto.setBrand(brand.getName());
            Airline airline = airlineRepository.findById(brand.getAirlineId()).orElse(null);
            if (airline != null) {
                dto.setAirline(airline.getName());
            }
        }

        // Get cabin structures
        List<CabinStructure> cabinStructures = cabinStructureRepository.findByAirplaneId(airplane.getAirplaneId());
        if (cabinStructures != null && !cabinStructures.isEmpty()) {
            List<AirplaneResponseDTO.CabinStructureDTO> cabinStructureDTOs = new ArrayList<>();

            for (CabinStructure cs : cabinStructures) {
                AirplaneResponseDTO.CabinStructureDTO csDto = new AirplaneResponseDTO.CabinStructureDTO();
                csDto.setNumberOfRows(cs.getNumberOfRows());
                csDto.setNumberOfSeatsPerRow(cs.getNumberOfSeatsPerRow());

                // Get service class information
                ServiceClass serviceClass = serviceClassRepository.findById(cs.getServiceClassId()).orElse(null);
                if (serviceClass != null) {
                    csDto.setServiceClass(serviceClass.getName());
                }

                cabinStructureDTOs.add(csDto);
            }

            dto.setCabinStructures(cabinStructureDTOs);
        }

        return dto;
    }
}