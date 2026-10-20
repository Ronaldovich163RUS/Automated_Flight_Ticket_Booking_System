package com.transfer.fasticket.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.transfer.fasticket.dto.BookingDTO;
import com.transfer.fasticket.dto.Role;
import com.transfer.fasticket.dto.UserDTO;
import com.transfer.fasticket.services.HistoryService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/history")
public class HistoryController {
    @Autowired
    private HistoryService historyService;
    
    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public String getView(HttpSession session, Model model) throws JsonProcessingException {
        Optional<UserDTO> userDto = Optional.ofNullable((UserDTO) session.getAttribute("user"));
        
        if (userDto.isEmpty() || userDto.get().getRole() != Role.CLIENT) {
            return "redirect:/login";
        }

        List<BookingDTO> bookings = historyService.getPastBookingsByClientId(userDto.get().getClientId().get());
        model.addAttribute("bookingsJson", objectMapper.writeValueAsString(bookings));
        return "history";
    }

    @PostMapping("/email/{bookingId}")
    public ResponseEntity<?> sendEmail(@PathVariable Integer bookingId) {
        // Implementation for sending email
        return ResponseEntity.ok().body(Map.of("message", "Email sent successfully"));
    }

    @PostMapping("/download/{bookingId}")
    public ResponseEntity<?> downloadTicket(@PathVariable Integer bookingId) {
        // Implementation for downloading ticket
        return ResponseEntity.ok().body(Map.of("message", "Ticket downloaded successfully"));
    }
}