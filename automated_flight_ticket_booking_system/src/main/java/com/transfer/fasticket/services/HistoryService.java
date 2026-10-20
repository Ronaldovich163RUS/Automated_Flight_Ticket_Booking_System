package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.BookingDTO;
import com.transfer.fasticket.repositories.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HistoryService {
    @Autowired
    private BookingRepository bookingRepository;

    @Transactional
    public List<BookingDTO> getPastBookingsByClientId(Integer clientId) {
        return bookingRepository.findPastBookingsByClientId(clientId);
    }
} 