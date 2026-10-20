package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.AdminFlightDTO;
import com.transfer.fasticket.dto.FlightResponseDTO;
import com.transfer.fasticket.services.AirlineService;
import com.transfer.fasticket.services.CityService;
import com.transfer.fasticket.services.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/flights")
public class FlightController {

    private final FlightService flightService;
    private final AirlineService airlineService;
    private final CityService cityService;

    @Autowired
    public FlightController(FlightService flightService, AirlineService airlineService, CityService cityService) {
        this.flightService = flightService;
        this.airlineService = airlineService;
        this.cityService = cityService;
    }

    @GetMapping
    public String showFlightsPage(Model model) {
        List<FlightResponseDTO> flights = flightService.getAllFlights();
        model.addAttribute("flights", flights);
        model.addAttribute("airlines", airlineService.getAllAirlines());
        model.addAttribute("cities", cityService.getAllNames());
        return "flights";
    }

    @PostMapping
    @ResponseBody
    public ResponseEntity<FlightResponseDTO> addFlight(@RequestBody AdminFlightDTO flightDTO) {
        FlightResponseDTO responseDTO = flightService.addFlight(flightDTO);
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/search")
    @ResponseBody
    public ResponseEntity<List<FlightResponseDTO>> searchFlights(
            @RequestParam(required = false) String departureCity,
            @RequestParam(required = false) String destinationCity,
            @RequestParam(required = false) String departureDate) {
        List<FlightResponseDTO> flights = flightService.searchFlights(departureCity, destinationCity, departureDate);
        return ResponseEntity.ok(flights);
    }

    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteFlight(@PathVariable Integer id) {
        flightService.deleteFlight(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @ResponseBody
    public ResponseEntity<?> updateFlight(@PathVariable Integer id, @RequestBody AdminFlightDTO dto) {
        try {
            dto.setFlightId(id);
            FlightResponseDTO updated = flightService.updateFlight(dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @ResponseBody
    public ResponseEntity<FlightResponseDTO> getFlightById(@PathVariable Integer id) {
        var flight = flightService.getFlightById(id);
        if (flight == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(flight);
    }
}