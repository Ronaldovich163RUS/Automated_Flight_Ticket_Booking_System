package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.ClientRegistrationDTO;
import com.transfer.fasticket.dto.LoginDTO;
import com.transfer.fasticket.dto.Role;
import com.transfer.fasticket.dto.UserDTO;
import com.transfer.fasticket.exceptions.*;
import com.transfer.fasticket.models.Client;
import com.transfer.fasticket.models.PersonalInformation;
import com.transfer.fasticket.services.RegistrationService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/registration")
public class RegistrationController {
    @Autowired
    private RegistrationService registrationService;

    /*
    @GetMapping
    public String showRegistrationForm(Model model) {
        model.addAttribute("clientRegistrationDto", new ClientRegistrationDTO());
        return "registration";
    }


    @PostMapping
    public String registerClient(
            @Validated @ModelAttribute("clientRegistrationDto") ClientRegistrationDTO clientRegistrationDto,
            BindingResult bindingResult,
            Model model
    ) {

        try {
            if (!clientRegistrationDto.getPassword().equals(clientRegistrationDto.getConfirmPassword())) {
                bindingResult.rejectValue("confirmPassword", "error.clientRegistrationDto", "Пароли не совпадают");
            }
            registrationService.registerNewClient(clientRegistrationDto);
        }
        catch (DuplicateEmailException e) {
            bindingResult.rejectValue("email", "error.clientRegistrationDTO", e.getMessage());
        }
        catch (DuplicatePhoneNumberException e){
            bindingResult.rejectValue("phoneNumber", "error.clientRegistrationDTO", e.getMessage());
        }
        finally {
            if(!bindingResult.hasErrors()){
                return "redirect:/login";
            }
            else{
                return "registration";
            }
        }

    }
     */

    @GetMapping
    public String getView(
            HttpSession session,
            Model model
    ){
        Optional<UserDTO> userDto = Optional.ofNullable((UserDTO)session.getAttribute("user"));
        if (userDto.isEmpty()){
            session.setAttribute("user", new UserDTO());
        }
        else if (userDto.get().getRole() == Role.USER){
            // do nothing
        }
        else if (userDto.get().getRole() == Role.CLIENT){
            return "redirect:/account";
        }
        else {
            return "redirect:/";
        }
        model.addAttribute("clientRegistrationDto", new ClientRegistrationDTO());
        return "registration";
    }

    @PostMapping
    public ResponseEntity<?> registerClient(
            @Valid @RequestBody ClientRegistrationDTO clientDto,
            BindingResult bindingResult
    ) {
        try {
            registrationService.registerNewClient(clientDto);
            return ResponseEntity.ok()
                    .body(Map.of("redirectUrl", "/login"));
        } catch (DuplicatePhoneNumberException e) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "errorType", "duplicatePhoneNumberError",
                            "message", "Номер телефона уже используется"
                    ));

        }
        catch (DuplicateEmailException e) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "errorType", "duplicateEmailError",
                            "message", "Email уже используется"
                    ));
        }

    }



}
