package com.transfer.fasticket.controllers;


import com.transfer.fasticket.dto.AirplaneDTO;
import com.transfer.fasticket.dto.AirplaneResponseDTO;
import com.transfer.fasticket.services.AirplaneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/airplanes")
public class AirplaneController {

    private final AirplaneService airplaneService;

    @Autowired
    public AirplaneController(AirplaneService airplaneService) {
        this.airplaneService = airplaneService;
    }

    @GetMapping
    public String showAirplanesPage(Model model) {
        List<AirplaneResponseDTO> airplanes = airplaneService.getAllAirplanes();
        model.addAttribute("airplanes", airplanes);
        return "airplanes";
    }

    @PostMapping
    @ResponseBody
    public ResponseEntity<AirplaneResponseDTO> addAirplane(@RequestBody AirplaneDTO airplaneDTO) {
        AirplaneResponseDTO responseDTO = airplaneService.addAirplane(airplaneDTO);
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/search")
    @ResponseBody
    public ResponseEntity<List<AirplaneResponseDTO>> searchAirplanes(
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String airline) {

        List<AirplaneResponseDTO> airplanes = airplaneService.searchAirplanes(model, brand, airline);
        return ResponseEntity.ok(airplanes);
    }

    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteAirplane(@PathVariable Integer id) {
        airplaneService.deleteAirplane(id);
        return ResponseEntity.ok().build();
    }
}