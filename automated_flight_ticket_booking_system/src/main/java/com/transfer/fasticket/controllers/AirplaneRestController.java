package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.AirplaneDTO;
import com.transfer.fasticket.dto.AirplaneResponseDTO;
import com.transfer.fasticket.models.Flight;
import com.transfer.fasticket.services.AirplaneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/airplanes")
public class AirplaneRestController {
    private final AirplaneService airplaneService;

    @Autowired
    public AirplaneRestController(AirplaneService airplaneService) {
        this.airplaneService = airplaneService;
    }

    @PostMapping
    public ResponseEntity<?> addAirplane(@RequestBody AirplaneDTO airplaneDTO) {
        try {
            AirplaneResponseDTO responseDTO = airplaneService.addAirplane(airplaneDTO);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<?> editAirplane(@RequestBody AirplaneDTO airplaneDTO) {
        try {
            AirplaneResponseDTO responseDTO = airplaneService.editAirplane(airplaneDTO);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAirplane(@PathVariable Integer id) {
        try {
            airplaneService.deleteAirplane(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            e.printStackTrace(); // Логирование ошибки
            String msg = e.getMessage();
            if ("NOT_FOUND".equals(msg)) {
                return ResponseEntity.ok().build();
            }
            if (msg != null && msg.startsWith("Самолёт используется в рейсах: ")) {
                String flights = msg.replace("Самолёт используется в рейсах: ", "");
                String[] flightNumbers = flights.split(", ");
                return ResponseEntity.status(409).body(java.util.Map.of("flights", flightNumbers));
            }
            return ResponseEntity.status(409).body(msg);
        }
    }

    @GetMapping("/{id}/flights")
    public ResponseEntity<?> getFlightsByAirplane(@PathVariable Integer id) {
        List<Flight> flights = airplaneService.getFlightsByAirplaneId(id);
        List<String> flightNumbers = flights.stream()
                .map(Flight::getFlightNumber)
                .toList();
        return ResponseEntity.ok(java.util.Map.of("flights", flightNumbers));
    }
}