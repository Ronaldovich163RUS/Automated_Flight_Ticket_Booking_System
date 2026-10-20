package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.FilterDTO;
import com.transfer.fasticket.dto.FlightDTO;
import com.transfer.fasticket.dto.Role;
import com.transfer.fasticket.dto.UserDTO;
import com.transfer.fasticket.services.CityService;
import com.transfer.fasticket.services.ClientService;
import com.transfer.fasticket.services.ResultsService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/results")
public class ResultsController {
    @Autowired
    ResultsService resultsService;
    @Autowired
    ClientService clientService;
    @Autowired
    CityService cityService;

    @GetMapping
    public String getFlights(HttpSession session, Model model) {
        // Always add cities list to the model first
        model.addAttribute("cities", cityService.getAllNamesExceptSamara());
        
        FilterDTO filterDTO = (FilterDTO) session.getAttribute("filterDTO");
        
        if (filterDTO != null) {
            // Получаем рейсы на основе сохраненных фильтров
            List<FlightDTO> flightsOneWay = resultsService.getFlightsOneWay(
                    filterDTO.getDestinationCity(),
                    filterDTO.getDepartureDate()
            );
            
            Map<String, Object> flightData = new HashMap<>();
            flightData.put("flightsOneWay", flightsOneWay);
            
            if (!filterDTO.getTripType()) {
                List<FlightDTO> flightsReturn = resultsService.getFlightsReturn(
                        filterDTO.getDestinationCity(),
                        filterDTO.getReturnDate()
                );
                flightData.put("flightsReturn", flightsReturn);
            }
            
            model.addAttribute("flightData", flightData);
            model.addAttribute("filter", filterDTO);
        } else {
            model.addAttribute("filter", new FilterDTO());
            model.addAttribute("flightData", new HashMap<>());
        }
        
        return "results";
    }

    /*
    @PostMapping
    public String processSearch(
            @Valid @ModelAttribute("filter") FilterDTO filter,
            BindingResult result,
            RedirectAttributes attributes) {

        if (result.hasErrors()) {
            return "search-form";
        }

        // Валидация младенцев
        if (filter.getInfants() > filter.getAdults()) {
            result.rejectValue("infants", "error.infantLimit");
        }

        attributes.addAttribute("filter", filter);
        return "redirect:/results";
    }
    */

    @PutMapping("/search")
    public ResponseEntity<?> searchFlights(
            @RequestBody FilterDTO filterDTO,
            HttpSession session
    ) {
        try {
            // Валидация
            if (filterDTO == null) {
                return ResponseEntity.badRequest().body("Filter data is required");
            }
            
            if (filterDTO.getDestinationCity() == null || filterDTO.getDestinationCity().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Destination city is required");
            }
            
            if (filterDTO.getDepartureDate() == null) {
                return ResponseEntity.badRequest().body("Departure date is required");
            }
            
            if (!filterDTO.getTripType() && filterDTO.getReturnDate() == null) {
                return ResponseEntity.badRequest().body("Return date is required for round trips");
            }

            // Сохраняем фильтры в сессии
            session.setAttribute("filterDTO", filterDTO);

            // Возвращаем успешный ответ
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing search: " + e.getMessage());
        }
    }

    /*
    @GetMapping("/api")
    public ResponseEntity<?> getFlightsApi(
            HttpSession session
    ) {
        try {
            FilterDTO filterDTO = (FilterDTO) session.getAttribute("filterDTO");
            
            if (filterDTO == null) {
                return ResponseEntity.badRequest().body("No filter data found in session");
            }

            Map<String, Object> body = new HashMap<>();
            
            try {
                List<FlightDTO> flightsOneWay = resultsService.getFlightsOneWay(
                        filterDTO.getDestinationCity(),
                        filterDTO.getDepartureDate()
                );
                body.put("flightsOneWay", flightsOneWay);

                if (!filterDTO.getTripType()) {
                    List<FlightDTO> flightsReturn = resultsService.getFlightsReturn(
                            filterDTO.getDestinationCity(),
                            filterDTO.getReturnDate()
                    );
                    body.put("flightsReturn", flightsReturn);
                }

                return ResponseEntity.ok(body);
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Error fetching flights: " + e.getMessage());
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing request: " + e.getMessage());
        }
    }
     */

    @PostMapping("/book")
    public ResponseEntity<?> bookFlight(
            @RequestBody Map<String, Object> bookingData,
            HttpSession session
    ) {
        try {
            Integer outboundFlightId = (Integer) bookingData.get("outboundFlightId");
            Integer returnFlightId = (Integer) bookingData.get("returnFlightId");
            Boolean isRoundTrip = (Boolean) bookingData.get("isRoundTrip");

            System.out.println(outboundFlightId);
            System.out.println(returnFlightId);
            System.out.println(isRoundTrip);

            if (outboundFlightId == null) {
                return ResponseEntity.badRequest().body("Outbound flight ID is required");
            }

            // Сохраняем фильтры в сессии
            session.setAttribute("outboundFlightId", outboundFlightId);
            if (returnFlightId != null) {
                session.setAttribute("returnFlightId", returnFlightId);
            }
            if (isRoundTrip != null) {
                session.setAttribute("isRoundTrip", isRoundTrip);
            }

            // Возвращаем успешный ответ
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing booking: " + e.getMessage());
        }
    }

}
