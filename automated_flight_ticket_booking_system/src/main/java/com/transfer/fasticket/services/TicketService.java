package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.AdminTicketDTO;
import com.transfer.fasticket.models.*;
import com.transfer.fasticket.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final PersonalInformationRepository personalInformationRepository;
    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final FlightRepository flightRepository;
    private final CityRepository cityRepository;
    private final SeatStructureRepository seatStructureRepository;
    private final CabinStructureRepository cabinStructureRepository;
    private final ServiceClassRepository serviceClassRepository;

    @Autowired
    public TicketService(TicketRepository ticketRepository,
                        PersonalInformationRepository personalInformationRepository,
                        BookingRepository bookingRepository,
                        SeatRepository seatRepository,
                        FlightRepository flightRepository,
                        CityRepository cityRepository,
                        SeatStructureRepository seatStructureRepository,
                        CabinStructureRepository cabinStructureRepository,
                        ServiceClassRepository serviceClassRepository) {
        this.ticketRepository = ticketRepository;
        this.personalInformationRepository = personalInformationRepository;
        this.bookingRepository = bookingRepository;
        this.seatRepository = seatRepository;
        this.flightRepository = flightRepository;
        this.cityRepository = cityRepository;
        this.seatStructureRepository = seatStructureRepository;
        this.cabinStructureRepository = cabinStructureRepository;
        this.serviceClassRepository = serviceClassRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminTicketDTO> getTicketsByBooking(Integer bookingId) {
        List<Ticket> tickets = ticketRepository.findByBookingId(bookingId);
        return tickets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminTicketDTO> getTicketsByPersonalInformation(Integer personalInformationId) {
        List<Ticket> tickets = ticketRepository.findByPersonalInformationId(personalInformationId);
        return tickets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminTicketDTO createTicket(Integer personalInformationId, Integer bookingId, Integer seatId) {
        Ticket ticket = new Ticket();
        ticket.setPersonalInformationId(personalInformationId);
        ticket.setBookingId(bookingId);
        ticket.setSeatId(seatId);

        // Mark the seat as taken
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found: " + seatId));
        seat.setTaken(true);
        seatRepository.save(seat);

        Ticket savedTicket = ticketRepository.save(ticket);
        return convertToDTO(savedTicket);
    }

    private AdminTicketDTO convertToDTO(Ticket ticket) {
        AdminTicketDTO dto = new AdminTicketDTO();
        dto.setTicketId(ticket.getTicketId());
        dto.setPersonalInformationId(ticket.getPersonalInformationId());
        dto.setBookingId(ticket.getBookingId());
        dto.setSeatId(ticket.getSeatId());

        // Get passenger information
        PersonalInformation personalInfo = personalInformationRepository.findById(ticket.getPersonalInformationId())
                .orElseThrow(() -> new RuntimeException("Personal information not found: " + ticket.getPersonalInformationId()));
        dto.setPassengerName(String.format("%s %s %s",
                personalInfo.getLastName(),
                personalInfo.getFirstName(),
                personalInfo.getMiddleName() != null ? personalInfo.getMiddleName() : ""));

        // Calculate passenger age
        if (personalInfo.getDateOfBirth() != null) {
            int age = java.time.Period.between(
                    personalInfo.getDateOfBirth().toLocalDate(),
                    java.time.LocalDate.now()
            ).getYears();
            dto.setPassengerAge(age);
        }

        // Get seat and flight information
        Seat seat = seatRepository.findById(ticket.getSeatId())
                .orElseThrow(() -> new RuntimeException("Seat not found: " + ticket.getSeatId()));

        Flight flight = flightRepository.findById(seat.getFlightId())
                .orElseThrow(() -> new RuntimeException("Flight not found: " + seat.getFlightId()));

        dto.setFlightNumber(flight.getFlightNumber());

        // Get cities
        City departureCity = cityRepository.findById(flight.getDepartureCityId())
                .orElseThrow(() -> new RuntimeException("Departure city not found: " + flight.getDepartureCityId()));
        City destinationCity = cityRepository.findById(flight.getDestinationCityId())
                .orElseThrow(() -> new RuntimeException("Destination city not found: " + flight.getDestinationCityId()));

        dto.setDepartureCity(departureCity.getName());
        dto.setDestinationCity(destinationCity.getName());

        // Format dates
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        dto.setDepartureDate(flight.getDepartureDate().toLocalDate().format(dateFormatter));
        dto.setDepartureTime(flight.getDepartureTime().toLocalTime().format(timeFormatter));

        // Get seat information
        SeatStructure seatStructure = seatStructureRepository.findById(seat.getSeatStructureId())
                .orElseThrow(() -> new RuntimeException("Seat structure not found: " + seat.getSeatStructureId()));

        CabinStructure cabinStructure = cabinStructureRepository.findById(seatStructure.getCabinStructureId())
                .orElseThrow(() -> new RuntimeException("Cabin structure not found: " + seatStructure.getCabinStructureId()));

        ServiceClass serviceClass = serviceClassRepository.findById(cabinStructure.getServiceClassId())
                .orElseThrow(() -> new RuntimeException("Service class not found: " + cabinStructure.getServiceClassId()));

        dto.setSeatNumber(String.format("%d%s", seatStructure.getRow(), String.valueOf(seatStructure.getSeat())));
        dto.setServiceClass(serviceClass.getName());
        dto.setPrice(BigDecimal.valueOf(seat.getPrice()));

        return dto;
    }
} 