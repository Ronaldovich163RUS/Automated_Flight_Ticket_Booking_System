package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.AirlineDTO;
import com.transfer.fasticket.dto.AirplaneDTO;
import com.transfer.fasticket.dto.BrandDTO;
import com.transfer.fasticket.dto.ClientResponseDTO;
import com.transfer.fasticket.models.Client;
import com.transfer.fasticket.repositories.*;
import com.transfer.fasticket.services.AirlineService;
import com.transfer.fasticket.services.AirplaneService;
import com.transfer.fasticket.services.BrandService;
import com.transfer.fasticket.services.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReferenceDataRestController {
    private final AirlineService airlineService;
    private final BrandService brandService;
    private final AirplaneService airplaneService;
    @Autowired
    TicketService ticketService;
    private final PersonalInformationRepository personalInformationRepository;
    private final TicketRepository ticketRepository;
    private final ClientRepository clientRepository;
    private final SeatRepository seatRepository;
    private final FlightRepository flightRepository;
    private final CabinStructureRepository cabinStructureRepository;
    private final SeatStructureRepository seatStructureRepository;
    private final ServiceClassRepository serviceClassRepository;

    @Autowired
    public ReferenceDataRestController(
            AirlineService airlineService,
            BrandService brandService,
            AirplaneService airplaneService,
            //TicketService ticketService,
            PersonalInformationRepository personalInformationRepository,
            TicketRepository ticketRepository,
            ClientRepository clientRepository,
            SeatRepository seatRepository,
            FlightRepository flightRepository,
            CabinStructureRepository cabinStructureRepository,
            SeatStructureRepository seatStructureRepository,
            ServiceClassRepository serviceClassRepository) {
        this.airlineService = airlineService;
        this.brandService = brandService;
        this.airplaneService = airplaneService;
        //this.ticketService = ticketService;
        this.personalInformationRepository = personalInformationRepository;
        this.ticketRepository = ticketRepository;
        this.clientRepository = clientRepository;
        this.seatRepository = seatRepository;
        this.flightRepository = flightRepository;
        this.cabinStructureRepository = cabinStructureRepository;
        this.seatStructureRepository = seatStructureRepository;
        this.serviceClassRepository = serviceClassRepository;
    }

    @GetMapping("/airlines")
    public ResponseEntity<List<AirlineDTO>> getAllAirlines() {
        return ResponseEntity.ok(airlineService.getAllAirlines());
    }

    @GetMapping("/brands")
    public ResponseEntity<List<BrandDTO>> getBrandsByAirline(@RequestParam Integer airlineId) {
        return ResponseEntity.ok(brandService.getBrandsByAirlineId(airlineId));
    }

    @GetMapping("/models")
    public ResponseEntity<List<AirplaneDTO>> getModelsByBrand(@RequestParam Integer brandId) {
        return ResponseEntity.ok(airplaneService.getAirplanesByBrandId(brandId));
    }

    @GetMapping("/bookings/{bookingId}/clients")
    public ResponseEntity<List<ClientResponseDTO>> getClientsByBooking(@PathVariable Integer bookingId) {
        var tickets = ticketRepository.findByBookingId(bookingId);
        var clientResponseList = new java.util.ArrayList<ClientResponseDTO>();
        Integer flightId = null;
        if (!tickets.isEmpty()) {
            var seat = seatRepository.findById(tickets.get(0).getSeatId()).orElse(null);
            if (seat != null) {
                flightId = seat.getFlightId();
            }
        }
        Integer airplaneId = null;
        if (flightId != null) {
            var flightOpt = flightRepository.findById(flightId);
            if (flightOpt.isPresent()) {
                airplaneId = flightOpt.get().getAirplaneId();
            }
        }
        List<com.transfer.fasticket.models.CabinStructure> cabins = new java.util.ArrayList<>();
        if (airplaneId != null) {
            cabins = cabinStructureRepository.findByAirplaneId(airplaneId);
            cabins.sort(
                    java.util.Comparator.comparing(com.transfer.fasticket.models.CabinStructure::getServiceClassId));
        }
        java.util.Map<Integer, Integer> cabinRowOffset = new java.util.HashMap<>();
        int offset = 0;
        for (var cabin : cabins) {
            cabinRowOffset.put(cabin.getCabinStructureId(), offset);
            offset += cabin.getNumberOfRows();
        }
        for (var ticket : tickets) {
            var personalOpt = personalInformationRepository.findById(ticket.getPersonalInformationId());
            if (personalOpt.isEmpty())
                continue;
            var personal = personalOpt.get();
            var clientOpt = clientRepository.findByPersonalInformationId(personal.getPersonalInformationId());
            String email = null, phone = null;
            if (clientOpt.isPresent()) {
                email = clientOpt.get().getEmail();
                phone = clientOpt.get().getPhoneNumber();
            }
            var dto = new ClientResponseDTO();
            dto.setId(clientOpt.map(Client::getClientId).orElse(null));
            dto.setLastName(personal.getLastName());
            dto.setFirstName(personal.getFirstName());
            dto.setMiddleName(personal.getMiddleName());
            dto.setGender(personal.getGender());
            dto.setBirthDate(personal.getDateOfBirth() != null ? personal.getDateOfBirth().toLocalDate() : null);
            dto.setDocumentNumber(
                    personal.getDocumentNumber() != null ? String.valueOf(personal.getDocumentNumber()) : null);
            dto.setDocument(personal.getDocument() != null ? personal.getDocument().name().toLowerCase() : null);
            dto.setEmail(email);
            dto.setPhone(phone);
            dto.setCitizenship(personal.getCitizenship());
            var seat = seatRepository.findById(ticket.getSeatId()).orElse(null);
            if (seat != null) {
                var seatStructure = seatStructureRepository.findById(seat.getSeatStructureId()).orElse(null);
                if (seatStructure != null) {
                    var cabin = cabinStructureRepository.findById(seatStructure.getCabinStructureId()).orElse(null);
                    if (cabin != null) {
                        int absRow = (cabinRowOffset.getOrDefault(cabin.getCabinStructureId(), 0))
                                + seatStructure.getRow();
                        dto.setAbsoluteRowNumber(absRow);
                        dto.setRow(seatStructure.getRow());
                        dto.setSeatLetter(seatStructure.getSeat().charAt(0));
                        var serviceClass = serviceClassRepository.findById(cabin.getServiceClassId()).orElse(null);
                        if (serviceClass != null) {
                            String ruName = switch (serviceClass.getName().toUpperCase()) {
                                case "FIRST" -> "Первый";
                                case "BUSINESS" -> "Бизнес";
                                case "COMFORT" -> "Комфорт";
                                case "ECONOMY" -> "Эконом";
                                default -> serviceClass.getName();
                            };
                            dto.setServiceClass(ruName);
                        }
                    }
                }
            }
            clientResponseList.add(dto);
        }
        return ResponseEntity.ok(clientResponseList);
    }
}