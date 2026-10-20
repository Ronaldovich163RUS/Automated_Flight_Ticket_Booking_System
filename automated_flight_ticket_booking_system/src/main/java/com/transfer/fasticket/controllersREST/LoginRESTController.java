package com.transfer.fasticket.controllersREST;

import com.transfer.fasticket.controllers.LoginController;
import com.transfer.fasticket.dto.ClientRegistrationDTO;
import com.transfer.fasticket.dto.LoginDTO;
import com.transfer.fasticket.dto.UserDTO;
import com.transfer.fasticket.exceptions.ClientNotFoundException;
import com.transfer.fasticket.exceptions.DuplicateEmailException;
import com.transfer.fasticket.exceptions.DuplicatePhoneNumberException;
import com.transfer.fasticket.exceptions.LoginFailedException;
import com.transfer.fasticket.services.LoginService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/login_rest")
public class LoginRESTController {
    @GetMapping("/.well-known/appspecific/com.chrome.devtools.json")
    public ResponseEntity<Map<String, Object>> handleDevToolsRequest() {
        return ResponseEntity.ok().body(Map.of("status", "ok"));
    }
    @Autowired
    LoginService loginService;


    @PostMapping
    public ResponseEntity<?> login(
            @RequestBody LoginDTO loginDTO,
            BindingResult bindingResult,
            HttpSession session
    ) {
        try {
            UserDTO userDto = loginService.loginClient(loginDTO);
            session.setAttribute("userDto", userDto);
            return ResponseEntity.ok()
                    .header("redirectUrl", "/account")
                    .build();
        } catch (ClientNotFoundException e) {
            return ResponseEntity.badRequest()
                    .header("errorType", "loginError")
                    .header("errorMessage", e.getMessage())
                    .build();
        } catch (LoginFailedException e) {
            return ResponseEntity.badRequest()
                    .header("errorType", "passwordError")
                    .header("errorMessage", e.getMessage())
                    .build();
        }
    }

}
