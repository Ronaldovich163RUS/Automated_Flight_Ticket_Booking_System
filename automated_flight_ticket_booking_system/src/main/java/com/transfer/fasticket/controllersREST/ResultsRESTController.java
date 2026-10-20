package com.transfer.fasticket.controllersREST;

import com.transfer.fasticket.dto.FilterDTO;
import com.transfer.fasticket.dto.FlightDTO;
import com.transfer.fasticket.services.ResultsService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/results_rest")
@CrossOrigin(origins = "http://localhost:8080")
public class ResultsRESTController {
    @Autowired
    ResultsService resultsService;

    @PutMapping
    public ResponseEntity<?> saveFilter(
            @RequestBody FilterDTO filterDTO,
            HttpSession session
    ) {
        try {
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

            session.setAttribute("filterDTO", filterDTO);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error saving filter: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getFlights(
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
}
