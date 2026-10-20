package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.AirplaneResponseDTO;
import com.transfer.fasticket.services.AirplaneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/constructor")
public class ConstructorController {
    @Autowired
    AirplaneService airplaneService;

    private Integer currentAirplaneId;

    @GetMapping
    public String showConstructorPage(Model model) {
        model.addAttribute("mode", "add");
        return "constructor";
    }

    @GetMapping("/edit")
    public String showConstructorPageForEdit(
        @RequestParam Integer airplaneId,
        Model model
    ) {
        currentAirplaneId = airplaneId;
        System.out.println(currentAirplaneId);
        model.addAttribute("mode", "edit");
        AirplaneResponseDTO airplane = airplaneService.getAirplaneById(currentAirplaneId);
        System.out.println(airplane);
        model.addAttribute("airplaneId", airplaneId);
        model.addAttribute("airplane", airplane);
        return "constructor";
    }

    @GetMapping("/api")
    @ResponseBody
    public ResponseEntity<?> getParameters() {
        Map<String, Object> body = new HashMap<>();
        System.out.println(currentAirplaneId);
        try{
            AirplaneResponseDTO airplane = airplaneService.getAirplaneById(currentAirplaneId);
            System.out.println(airplane);
            body.put("airplaneId", airplane.getAirplaneId());
            body.put("brandId", airplane.getBrandId());
            body.put("model", airplane.getModel());
            body.put("range", airplane.getRange());
            body.put("numberOfPassages", airplane.getNumberOfPassages());
            body.put("brand", airplane.getBrand());
            body.put("airline", airplane.getAirline());
            body.put("cabinStructures", airplane.getCabinStructures());
            return ResponseEntity.ok().body(body);
        }
        catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }
}