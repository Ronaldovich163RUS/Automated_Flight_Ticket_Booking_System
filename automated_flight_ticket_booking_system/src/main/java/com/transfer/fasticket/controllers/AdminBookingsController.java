package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.BookingResponseDTO;
import com.transfer.fasticket.services.AdminBookingService;
import com.transfer.fasticket.services.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/bookings")
public class AdminBookingsController {

    private static final Logger logger = LoggerFactory.getLogger(AdminBookingsController.class);
    @Autowired
    AdminBookingService adminBookingService;

    @GetMapping
    public String showBookingsPage(Model model) {
        logger.info("Fetching bookings for display");
        List<BookingResponseDTO> bookings = adminBookingService.getAllBookings();
        logger.info("Found {} bookings", bookings.size());
        if (bookings.isEmpty()) {
            logger.warn("No bookings found in the database");
        } else {
            logger.debug("First booking in list: {}", bookings.get(0));
        }
        model.addAttribute("bookings", bookings);
        return "admin-bookings";
    }
}
