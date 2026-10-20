package com.transfer.fasticket.controllers;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.transfer.fasticket.dto.*;
import com.transfer.fasticket.services.CityService;
import com.transfer.fasticket.services.ClientService;
import com.transfer.fasticket.services.ResultsService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/")
public class IndexController {
    @Autowired
    ResultsService resultsService;
    @Autowired
    ClientService clientService;
    @Autowired
    CityService cityService;

    /*
    @GetMapping
    public String getIndex(Model model){
        Iterable<String> cities = cityService.getAllNames();
        model.addAttribute("cities", cities);
        FilterDTO filterDTO = new FilterDTO();
        model.addAttribute("filter", filterDTO);
        return "index.html";
    }
     */

    @GetMapping
    public String getView(
            HttpSession session,
            Model model
    ){
        Optional<UserDTO> userDto = Optional.ofNullable(
                (UserDTO)session.getAttribute("user"));
        if (userDto.isEmpty()){
            session.setAttribute("user", new UserDTO());
            model.addAttribute("profile", "");
        }
        else if (userDto.get().getRole() == Role.CLIENT){
            model.addAttribute("profile",
                    clientService.getEmailById(userDto.get().getClientId().get()).get());
        }
        else if (userDto.get().getRole() == Role.ADMIN){
            model.addAttribute("profile", "admin");
        }
        else {
            model.addAttribute("profile", "");
        }
        Iterable<String> cities = cityService.getAllNamesExceptSamara();
        model.addAttribute("cities", cities);
        FilterDTO filterDTO = new FilterDTO();
        model.addAttribute("filter", filterDTO);
        return "index";
    }

    /* 
    @PostMapping
    public String searchFlights(
            @Valid @ModelAttribute("filter") FilterDTO filter,
            BindingResult result,
            RedirectAttributes attributes){
        if (result.hasErrors()) {
            return "index";
        }

        // Валидация младенцев
        if (filter.getInfants() > filter.getAdults()) {
            result.rejectValue("infants", "error.infantLimit");
        }

        attributes.addAttribute("filter", filter);
        return "redirect:/results";
    }
        */

    @PostMapping
    @ResponseBody
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
        session.setAttribute("filterDTO", filter);
        return ResponseEntity.ok()
                .body(Map.of(
                        "redirectUrl", "/results"
                ));
    }
}
