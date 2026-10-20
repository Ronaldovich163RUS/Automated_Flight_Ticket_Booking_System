package com.transfer.fasticket.controllersREST;

import com.transfer.fasticket.dto.ClientRegistrationDTO;
import com.transfer.fasticket.exceptions.DuplicateEmailException;
import com.transfer.fasticket.exceptions.DuplicateEntityException;
import com.transfer.fasticket.exceptions.DuplicatePhoneNumberException;
import com.transfer.fasticket.services.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;

@RestController
@RequestMapping("/registration_rest")
public class RegistrationRESTController {
    @Autowired
    private RegistrationService registrationService;
    @PostMapping
    public ResponseEntity<?> registerClient(
            @Valid @RequestBody ClientRegistrationDTO clientDto,
            BindingResult bindingResult
    ) {
        try {
            registrationService.registerNewClient(clientDto);
            return ResponseEntity.ok()
                    .header("redirectUrl", "/login")
                    .build();
        } catch (DuplicatePhoneNumberException | DuplicateEmailException e) {
            return ResponseEntity.badRequest()
                    .header("errorType", "duplicateError")
                    .header("error", e.getMessage())
                    .header("redirectUrl", "/registration")
                    .build();
        }

    }
}
