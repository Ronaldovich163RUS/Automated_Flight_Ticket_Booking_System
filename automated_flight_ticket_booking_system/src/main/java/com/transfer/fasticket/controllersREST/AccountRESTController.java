package com.transfer.fasticket.controllersREST;

import com.transfer.fasticket.controllers.AccountController;
import com.transfer.fasticket.dto.ClientDTO;
import com.transfer.fasticket.dto.Role;
import com.transfer.fasticket.dto.UserDTO;
import com.transfer.fasticket.exceptions.DuplicateEmailException;
import com.transfer.fasticket.exceptions.DuplicatePhoneNumberException;
import com.transfer.fasticket.services.AccountService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/account_rest")
@SessionAttributes("userDto")
public class AccountRESTController {
    @Autowired
    AccountService accountService;
    @GetMapping
    public ResponseEntity<?> getView(
            @SessionAttribute(value = "userDto", required = false) UserDTO userDto,
            HttpSession session
            ){
        HttpHeaders headers = new HttpHeaders();
        if (userDto == null){
            session.setAttribute("userDto", new UserDTO());
            headers.add("role", "USER");
        }
        else if (userDto.getRole() == Role.CLIENT){
            headers.add("role", "CLIENT");
        }
        else if (userDto.getRole() == Role.ADMIN){
            headers.add("role", "ADMIN");
        }
        else {
            headers.add("role", "USER");
        }
        return ResponseEntity.ok().headers(headers).build();
    }

    @PutMapping
    public ResponseEntity<?> updateClient(
            @RequestBody ClientDTO clientDTO,
            @SessionAttribute(value = "userDto", required = false) UserDTO userDto,
            HttpSession session
    ){
        try {
            accountService.updateClient(userDto.getClientId().get(), clientDTO);
            return ResponseEntity.ok()
                    .header("redirectUrl", "/account")
                    .build();
        }
        catch (DuplicateEmailException e){
            return ResponseEntity.badRequest()
                    .header("errorType", "duplicateEmailError")
                    .header("errorMessage", e.getMessage())
                    .build();
        }
        catch (DuplicatePhoneNumberException e){
            return ResponseEntity.badRequest()
                    .header("errorType", "duplicatePhoneNumberError")
                    .header("errorMessage", e.getMessage())
                    .build();
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteClient(
            @SessionAttribute(value = "userDto", required = false) UserDTO userDto,
            HttpSession session
    ){
        accountService.deleteClient(userDto.getClientId().get());
        userDto.setClientId(Optional.ofNullable(null));
        userDto.setRole(Role.USER);
        return ResponseEntity.ok()
                .header("redirectUrl", "/")
                .build();
    }


    @DeleteMapping("/logout")
    public ResponseEntity<?> logout(
            @SessionAttribute(value = "userDto", required = false) UserDTO userDto,
            HttpSession session
    ){
        userDto.setClientId(Optional.ofNullable(null));
        userDto.setRole(Role.USER);
        //session.setAttribute("userDto", userDto);
        return ResponseEntity.ok()
                .header("redirectUrl", "/")
                .build();
    }
}
