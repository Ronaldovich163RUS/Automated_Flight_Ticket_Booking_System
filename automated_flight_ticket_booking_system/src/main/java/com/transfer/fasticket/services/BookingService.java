package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.BookingRequestDTO;
import com.transfer.fasticket.dto.ContactDTO;
import com.transfer.fasticket.dto.FlightDTO;
import com.transfer.fasticket.dto.PassengerDTO;
import com.transfer.fasticket.models.Booking;
import com.transfer.fasticket.models.Flight;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.transfer.fasticket.models.PersonalInformation;
import com.transfer.fasticket.models.Ticket;
import com.transfer.fasticket.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.transfer.fasticket.models.Seat;

@Service
public class BookingService {
    @Autowired
    FlightRepository flightRepository;
    @Autowired
    CityRepository cityRepository;
    @Autowired
    AirlineRepository airlineRepository;
    @Autowired
    ClientRepository clientRepository;
    @Autowired
    PersonalInformationRepository personalInformationRepository;
    @Autowired
    BookingRepository bookingRepository;
    @Autowired
    TicketRepository ticketRepository;
    @Autowired
    SeatRepository seatRepository;

    public FlightDTO getFlightById(Integer flightId) {
        Optional<Flight> flight = flightRepository.findById(flightId);
        if (flight.isEmpty()) {
            return null;
        } else {
            return convertFlightToDTO(flight.get());
        }
    }

    public ContactDTO getContactById(Integer clientId) {
        ContactDTO contactDTO = new ContactDTO();
        contactDTO.setEmail(clientRepository.findEmailById(clientId).get());
        contactDTO.setPhoneNumber(clientRepository.findPhoneNumberById(clientId).get());
        return contactDTO;
    }
    private FlightDTO convertFlightToDTO(Flight flight) {
        FlightDTO flightDTO = new FlightDTO();
        flightDTO.setFlightID(flight.getFlightId());
        flightDTO.setFlightNumber(flight.getFlightNumber());
        flightDTO.setDepartureDate(flight.getDepartureDate().toLocalDate());
        flightDTO.setDepartureTime(flight.getDepartureTime().toLocalTime());
        flightDTO.setFlightDuration(flight.getFlightDuration().toLocalTime());
        flightDTO.setDepartureCity(cityRepository.findNameById(
                flight.getDepartureCityId()).get());
        flightDTO.setDestinationCity(cityRepository.findNameById(
                flight.getDestinationCityId()).get());
        flightDTO.setAirlineName(airlineRepository.findNameByAirplaneId(
                flight.getAirplaneId()).get());
        flightDTO.setArrivalDateTime();
        return flightDTO;
    }

    @Transactional
    public void setBooking(BookingRequestDTO bookingRequestDTO, Integer clientId){
        List<Integer> addedPassangerIDs = new ArrayList<>();
        if (bookingRequestDTO.getHasClientAsPassenger()){
            addedPassangerIDs.add(clientRepository.findById(clientId).get().getPersonalInformationId());
        }
        for (PassengerDTO passenger : bookingRequestDTO.getPassengers()){
            personalInformationRepository.save(convertPassengerToPersonalInformation(passenger));
            addedPassangerIDs.add(personalInformationRepository.selectLastId());
        }
        List<Integer> addedBookingIDs = new ArrayList<>();
        bookingRepository.save(new Booking(clientId, bookingRequestDTO.getBaggageCount(), bookingRequestDTO.getOutboundFlightId(), bookingRequestDTO.getTotalCost()));
        addedBookingIDs.add(bookingRepository.selectLastId());
        if (bookingRequestDTO.getIsRoundTrip()){
            bookingRepository.save(new Booking(clientId, bookingRequestDTO.getBaggageCount(), bookingRequestDTO.getReturnFlightId(), bookingRequestDTO.getTotalCost()));
            addedBookingIDs.add(bookingRepository.selectLastId());
        }

        // Now, associate personal information IDs with seats and create tickets
        Integer flightId = bookingRequestDTO.getOutboundFlightId();

        // Track the index for seats from bookingRequestDTO.getSeats()
        int seatIndex = 0;

        for (Integer personalInformationId : addedPassangerIDs) {
            Integer seatIdForCurrentTicket = null;

            // If the current personalInformationId is NOT the client's personalInformationId,
            // AND there are seats available in the seats array,
            // then try to assign a seat.
            // This implicitly assumes the client does not get a selected seat from the UI.
            // If client is also a passenger from form, this logic needs adjustment.
            if (bookingRequestDTO.getSeats() != null && seatIndex < bookingRequestDTO.getSeats().size() &&
                !(bookingRequestDTO.getHasClientAsPassenger() && personalInformationId.equals(clientRepository.findById(clientId).get().getPersonalInformationId()))) { 
                
                Object seatObj = bookingRequestDTO.getSeats().get(seatIndex);
                
                if (seatObj instanceof java.util.Map) {
                    java.util.Map seatMap = (java.util.Map) seatObj;
                    Integer row = null;
                    String seatLetter = null;

                    if (seatMap.get("row") instanceof Integer) {
                        row = (Integer) seatMap.get("row");
                    } else if (seatMap.get("row") instanceof String) {
                        row = Integer.parseInt((String) seatMap.get("row"));
                    }
                    if (seatMap.get("seat") instanceof String) {
                        seatLetter = (String) seatMap.get("seat");
                    } else if (seatMap.get("seat") != null) {
                        seatLetter = seatMap.get("seat").toString();
                    }

                    if (row != null && seatLetter != null) {
                        Seat seat = seatRepository.findByFlightIdAndRowAndSeat(flightId, row, seatLetter);
                        System.out.println("Найденное место: " + seat);
                        if (seat != null) {
                            seatIdForCurrentTicket = seat.getSeatId();
                            if (!Boolean.TRUE.equals(seat.getTaken())) {
                                seat.setTaken(true);
                                seatRepository.save(seat);
                            }
                        } else {
                            throw new RuntimeException("Выбранное место " + row + seatLetter + " для рейса " + flightId + " не найдено или недоступно.");
                        }
                    } else {
                        throw new RuntimeException("Некорректные данные о выбранном месте: ряд или буква места отсутствуют.");
                    }
                }
                seatIndex++; // Increment seat index only for actual passengers getting seats
            }

            // Create ticket for the current personalInformationId with the determined seatIdForCurrentTicket
            for (Integer bookingId : addedBookingIDs) {
                ticketRepository.save(new Ticket(personalInformationId, bookingId, seatIdForCurrentTicket));
            }
        }
    }

    private PersonalInformation convertPassengerToPersonalInformation(PassengerDTO passenger){
        PersonalInformation personalInformation = new PersonalInformation();
        personalInformation.setLastName(passenger.getLastName());
        personalInformation.setFirstName(passenger.getFirstName());
        personalInformation.setMiddleName(passenger.getMiddleName());
        personalInformation.setGender(passenger.getGender());
        personalInformation.setDateOfBirth(passenger.getDateOfBirth());
        personalInformation.setDocument(passenger.getDocument());
        personalInformation.setDocumentSeries(passenger.getDocumentSeries());
        personalInformation.setDocumentNumber(passenger.getDocumentNumber());
        personalInformation.setCitizenship(passenger.getCitizenship());
        return personalInformation;
    }
}