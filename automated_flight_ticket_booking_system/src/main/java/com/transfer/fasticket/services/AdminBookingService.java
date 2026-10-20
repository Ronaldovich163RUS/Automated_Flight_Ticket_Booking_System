package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.BookingResponseDTO;
import com.transfer.fasticket.models.Booking;
import com.transfer.fasticket.models.Flight;
import com.transfer.fasticket.repositories.BookingRepository;
import com.transfer.fasticket.repositories.FlightRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class AdminBookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;

    @Autowired
    public AdminBookingService(BookingRepository bookingRepository, FlightRepository flightRepository) {
        this.bookingRepository = bookingRepository;
        this.flightRepository = flightRepository;
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings() {
        logger.info("Fetching all bookings");
        try {
            Iterable<Booking> bookings = bookingRepository.findAll();
            List<BookingResponseDTO> dtos = StreamSupport.stream(bookings.spliterator(), false)
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            logger.info("Found {} bookings", dtos.size());
            return dtos;
        } catch (Exception e) {
            logger.error("Error fetching bookings: {}", e.getMessage(), e);
            throw e;
        }
    }

    private BookingResponseDTO convertToDTO(Booking booking) {
        logger.debug("Converting booking to DTO: {}", booking);
        try {
            BookingResponseDTO dto = new BookingResponseDTO();
            dto.setBookingId(booking.getBookingId());
            dto.setClientId(booking.getClientId());
            dto.setFlightId(booking.getFlightId());
            dto.setBaggageCount(booking.getBaggageCount());
            dto.setTotalCost(booking.getTotalCost());

            // Fetch and set flight number
            Flight flight = flightRepository.findById(booking.getFlightId())
                    .orElseThrow(() -> new RuntimeException("Flight not found: " + booking.getFlightId()));
            dto.setFlightNumber(flight.getFlightNumber());

            logger.debug("Successfully converted booking to DTO: {}", dto);
            return dto;
        } catch (Exception e) {
            logger.error("Error converting booking to DTO: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public boolean validateBookingData() {
        logger.info("Validating booking data");
        try {
            Iterable<Booking> bookings = bookingRepository.findAll();
            boolean isValid = true;
            for (Booking booking : bookings) {
                if (booking.getBookingId() == null ||
                        booking.getClientId() == null ||
                        booking.getFlightId() == null) {
                    logger.error("Invalid booking found: {}", booking);
                    isValid = false;
                }
            }
            logger.info("Booking data validation completed. Valid: {}", isValid);
            return isValid;
        } catch (Exception e) {
            logger.error("Error validating booking data: {}", e.getMessage(), e);
            return false;
        }
    }
}