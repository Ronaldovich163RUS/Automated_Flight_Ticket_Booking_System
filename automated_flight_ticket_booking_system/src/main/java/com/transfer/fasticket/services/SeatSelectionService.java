package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.CabinStructureDTO;
import com.transfer.fasticket.dto.CabinStructureWithSeatsDTO;
import com.transfer.fasticket.dto.SeatDTO;
import com.transfer.fasticket.models.Airplane;
import com.transfer.fasticket.models.CabinStructure;
import com.transfer.fasticket.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class SeatSelectionService {
    @Autowired
    SeatRepository seatRepository;
    @Autowired
    FlightRepository flightRepository;
    @Autowired
    AirplaneRepository airplaneRepository;
    @Autowired
    CabinStructureRepository cabinStructureRepository;

    /*
    public List<Map<String, ?>> getAllSeatsByFlightId(Integer flightId){
        Iterable<SeatDTO> seatDTOS = seatRepository.findAllByFlightId(flightId);
        return  convertToJSON(seatDTOS);
    }


    private List<Map<String, ?>>  convertToJSON(Iterable<SeatDTO> seatDTOS){
        List<Map<String, ?>> seats = new ArrayList<>();
        for (SeatDTO seat : seatDTOS){
            seats.add(Map.of(
                    "row", seat.getRow(),
                    "seat", seat.getSeat(),
                    "price", seat.getPrice(),
                    "taken", seat.getTaken()
            ));
        }
        return seats;
    }*/

    @Transactional
    public Map<String, Object> getAllSeatsByFlightId(Integer flightId){
        //Iterable<SeatDTO> seatDTOS = seatRepository.findAllByFlightId(flightId);
        Optional<Integer> airplaneId = flightRepository.findAirplaneIdById(flightId);
        if (airplaneId.isEmpty()){
            throw new RuntimeException("ID самолёта не найден");
        }

        Optional<Airplane> airplane = airplaneRepository.findById(airplaneId.get());
        if (airplane.isEmpty()){
            throw new RuntimeException("Самолёт не найден");
        }

        Map<String, Object> json = new HashMap<>();
        json.put("numberOfPassages", airplane.get().getNumberOfPassages());

        List<CabinStructureDTO> cabinStructureDTOS = cabinStructureRepository.findByAirplaneIdWithClasses(airplaneId.get());
        List<CabinStructureDTO> cabinStructures = new ArrayList<>();


        /*
        for (CabinStructureDTO cabinStructureDTO : cabinStructureDTOS){
            cabinStructureDTO.setSeatStructure(seatRepository.findByFlightIdAndCabinStructureId(flightId,
                    cabinStructureDTO.getCabinStructureID()));
        }*/

        //List<String> serviceClasses = List.of("ECONOMY", "COMFORT", "BUSINESS", "FIRST");
        List<String> serviceClasses = List.of("FIRST", "BUSINESS", "COMFORT", "ECONOMY");
        for (String serviceClass : serviceClasses) {
            Optional<CabinStructureDTO> cabinStructureDTO = findInList(cabinStructureDTOS, serviceClass);
            if (cabinStructureDTO.isPresent()) {
                cabinStructures.add(cabinStructureDTO.get());
            }
            else {
                cabinStructures.add(new CabinStructureDTO(null, serviceClass, 0, 0));
            }
        }

        List<CabinStructureWithSeatsDTO> cabinStructuresWithSeats = new ArrayList<>();
        for (CabinStructureDTO cabinStructure : cabinStructures){
            if (cabinStructure.getCabinStructureID() != null) {
                List<SeatDTO> seatStructure = seatRepository.findByFlightIdAndCabinStructureId(flightId,
                        cabinStructure.getCabinStructureID());
                Double price = seatRepository.getPriceForServiceClass(flightId,
                        cabinStructure.getCabinStructureID());
                cabinStructuresWithSeats.add(new CabinStructureWithSeatsDTO(
                        cabinStructure.getCabinStructureID(),
                        cabinStructure.getServiceClass(),
                        cabinStructure.getNumberOfRows(),
                        cabinStructure.getNumberOfSeatsPerRow(),
                        price,
                        seatStructure
                ));
            }
            else{
                cabinStructuresWithSeats.add(new CabinStructureWithSeatsDTO(null, cabinStructure.getServiceClass(),
                        0, 0, 0.0, null));
            }
        }

        //Map<String, Object> cabinStructuresJSON = new HashMap<>();
        List<Object> cabinStructuresJSON = new ArrayList<>();
        for (CabinStructureWithSeatsDTO cabinStructure : cabinStructuresWithSeats){
            List<Map<String, Object>> seatStructureJSON = new ArrayList<>();
            List<SeatDTO> seats = cabinStructure.getSeatStructure();
            if (seats != null){
                for (SeatDTO seatDTO : seats){
                    seatStructureJSON.add(Map.of(
                            "row", seatDTO.getRow(),
                            "seat", seatDTO.getSeat(),
                            "taken", seatDTO.getTaken()
                    ));
                }
            }
            cabinStructuresJSON.add(Map.of(
               "type", cabinStructure.getServiceClass(),
                    "rows", cabinStructure.getNumberOfRows(),
                    "seatsPerRow", cabinStructure.getNumberOfSeatsPerRow(),
                    "price", cabinStructure.getPrice(),
                    "seatStructure", seatStructureJSON
            ));
        }
        json.put("classes", cabinStructuresJSON);
        return json;
    }

    /*
    private Map<String, ?>  convertToJSON(Iterable<SeatDTO> seatDTOS){
        List<Map<String, ?>> seats = new ArrayList<>();
        for (SeatDTO seat : seatDTOS){
            seats.add(Map.of(
                    "row", seat.getRow(),
                    "seat", seat.getSeat(),
                    "price", seat.getPrice(),
                    "taken", seat.getTaken()
            ));
        }
        return seats;
    }
     */
    private Optional<CabinStructureDTO> findInList(List<CabinStructureDTO> cabinStructureDTOS, String serviceClass){
        for (CabinStructureDTO cabinStructureDTO : cabinStructureDTOS){
            if (serviceClass.equals(cabinStructureDTO.getServiceClass())){
                return Optional.of(cabinStructureDTO);
            }
        }
        return Optional.ofNullable(null);
    }
}
