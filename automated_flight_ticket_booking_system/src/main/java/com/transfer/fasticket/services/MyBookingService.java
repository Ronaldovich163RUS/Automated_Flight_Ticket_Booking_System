package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.BookingDTO;
import com.transfer.fasticket.repositories.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MyBookingService {
    @Autowired
    private BookingRepository bookingRepository;

    @Transactional
    public List<BookingDTO> getBookingsByClientId(Integer clientId) {
        return bookingRepository.findCurrentBookingsByClientId(clientId);
    }

    @Transactional
    public Optional<BookingDTO> getBookingById(Integer bookingId) {
        return bookingRepository.findBookingById(bookingId);
    }

    @Transactional
    public void cancelBooking(Integer bookingId){
        bookingRepository.deleteById(bookingId);
    }

    /* 
    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setBookingId(booking.getBookingId());
        
        return dto;
    }
        */
} 