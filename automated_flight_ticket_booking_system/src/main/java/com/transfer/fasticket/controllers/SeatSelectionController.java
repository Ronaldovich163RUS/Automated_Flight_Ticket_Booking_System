package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.FlightDTO;
import com.transfer.fasticket.dto.FromBookingToSelectSeatsDTO;
import com.transfer.fasticket.dto.SeatsInfoDTO;
import com.transfer.fasticket.repositories.SeatRepository;
import com.transfer.fasticket.services.SeatSelectionService;
import jakarta.servlet.http.HttpSession;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/seat-selection")
public class SeatSelectionController {
    @Autowired
    SeatSelectionService seatSelectionService;

    @GetMapping
    public String seatSelection(
            HttpSession session,
            Model model
    ) {
        FromBookingToSelectSeatsDTO parameters = (FromBookingToSelectSeatsDTO) session.getAttribute("fromBookingToSelectSeats");
        if (parameters == null) {
            return "redirect:/booking";
        }
        model.addAttribute("flightId", parameters.getFlightId());
        model.addAttribute("passengers", parameters.getPassengers());
        session.setAttribute("passengers", parameters.getPassengers());
        return "seat-selection";
    }

    /*
    @GetMapping
    public String seatSelection(@RequestBody FlightDTO flight) {
        return "seat-selection";
    }*/

    /*
    @GetMapping("/get-seats")
    @ResponseBody
    public ResponseEntity<?> getSeats(
            @RequestBody Integer flightId
    ){
        List<Map<String, ?>> body = seatSelectionService.getAllSeatsByFlightId(flightId);
        return ResponseEntity.ok(body);
    }
     */

    @PostMapping("/get-seats")
    @ResponseBody
    public ResponseEntity<?> getSeats(
            @RequestBody Integer flightId
    ){
        try {
            Map<String, Object> body = seatSelectionService.getAllSeatsByFlightId(flightId);
            return ResponseEntity.ok(body);
        }
        catch (RuntimeException e){
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/confirm")
    @ResponseBody
    public ResponseEntity<?> confirm(
            @RequestBody SeatsInfoDTO seatsInfo,
            HttpSession session
    ){
        try {
            //Map<String, Object> body = seatSelectionService.getAllSeatsByFlightId(flightId);
            System.out.println(seatsInfo);
            session.setAttribute("seatsInfo", seatsInfo);
            return ResponseEntity.ok().build();
        }
        catch (RuntimeException e){
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }
}