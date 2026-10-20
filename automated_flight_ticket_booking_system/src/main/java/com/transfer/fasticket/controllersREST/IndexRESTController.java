package com.transfer.fasticket.controllersREST;

import com.transfer.fasticket.dto.FilterDTO;
import com.transfer.fasticket.dto.FlightDTO;
import com.transfer.fasticket.services.ResultsService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("index_rest")
public class IndexRESTController {
    @Autowired
    ResultsService resultsService;
    @PostMapping
    public ResponseEntity<?> searchFlights(
            //@Valid @ModelAttribute("filter") FilterDTO filter,
            @RequestBody FilterDTO filter,
            HttpSession session
    ) {
        /*
        // Генерация уникального ID для результатов
        String searchId = UUID.randomUUID().toString();
        resultsService.saveSearchResults(searchId, filter);

        // Формирование URL для редиректа
        String redirectUrl = UriComponentsBuilder.fromPath("/results")
                .queryParam("searchId", searchId)
                .toUriString();

        return ResponseEntity.ok()
                .header("redirectUrl", redirectUrl)
                .body(Collections.singletonMap("redirectUrl", redirectUrl));

         */
        if (filter.getTripType()){
            List<FlightDTO> flightsOneWay = resultsService.getFlightsOneWay(
                    filter.getDestinationCity(), filter.getDepartureDate());
            return ResponseEntity.ok()
                    .body(Map.of(
                            "flightsOneWay", flightsOneWay,
                            "redirectUrl", "/results"
                    ));
        }
        else{
            List<FlightDTO> flightsOneWay = resultsService.getFlightsOneWay(
                    filter.getDestinationCity(), filter.getDepartureDate());
            List<FlightDTO> flightsReturn = resultsService.getFlightsReturn(
                    filter.getDestinationCity(), filter.getReturnDate());
            return ResponseEntity.ok()
                    .body(Map.of(
                            "flightsOneWay", flightsOneWay,
                            "flightsReturn", flightsReturn,
                            "redirectUrl", "/results"
                    ));
        }

    }
}
