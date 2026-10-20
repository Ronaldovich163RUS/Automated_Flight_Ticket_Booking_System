package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.ClientDTO;

import com.transfer.fasticket.dto.LoginDTO;
import com.transfer.fasticket.dto.Role;
import com.transfer.fasticket.dto.UserDTO;
import com.transfer.fasticket.exceptions.DuplicateEmailException;
import com.transfer.fasticket.exceptions.DuplicatePhoneNumberException;
import com.transfer.fasticket.repositories.ClientRepository;
import com.transfer.fasticket.services.AccountService;
import com.transfer.fasticket.services.ClientService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/account")
public class AccountController {
    @Autowired
    ClientService clientService;
    @Autowired
    AccountService accountService;

    /*
     * @GetMapping
     * public String account(@ModelAttribute("userDto") UserDTO userDTO, Model
     * model) {
     * ClientDTO clientDTO =
     * clientService.getClientById(userDTO.getClientId().get());
     * model.addAttribute("clientDto", clientDTO);
     * return "account";
     * }
     */

    @GetMapping
    public String getView(
            // @SessionAttribute(value = "userDto", required = false) UserDTO userDto,
            HttpSession session,
            Model model) {
        Optional<UserDTO> userDto = Optional.ofNullable(
                (UserDTO) session.getAttribute("user"));
        if (userDto.isEmpty()) {
            session.setAttribute("user", new UserDTO());
            model.addAttribute("profile", "");
            return "redirect:/";
        } else if (userDto.get().getRole() == Role.CLIENT) {
            ClientDTO clientDTO = clientService.getClientById(userDto.get().getClientId().get());

            model.addAttribute("clientDto", clientDTO);
            model.addAttribute("profile", clientDTO.getEmail());
            return "account";
        } else {
            model.addAttribute("loginDto", new LoginDTO());
            return "redirect:/";
        }
    }

    @PutMapping
    public ResponseEntity<?> updateClient(
            @RequestBody ClientDTO clientDTO,
            @SessionAttribute(value = "user", required = false) UserDTO userDto,
            HttpSession session) {
        try {
            accountService.updateClient(userDto.getClientId().get(), clientDTO);
            return ResponseEntity.ok()
                    .header("redirectUrl", "/account")
                    .build();
        } catch (DuplicateEmailException e) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "errorType", "duplicateEmailError",
                            "message", "Email уже используется"));
        } catch (DuplicatePhoneNumberException e) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "errorType", "duplicatePhoneNumberError",
                            "message", "Номер телефона уже используется"));
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteClient(
            @SessionAttribute(value = "user", required = false) UserDTO userDto,
            HttpSession session) {
        accountService.deleteClient(userDto.getClientId().get());
        userDto.setClientId(Optional.ofNullable(null));
        userDto.setRole(Role.USER);
        return ResponseEntity.ok().body(Map.of(
                "redirectUrl", "/"));
    }

    @DeleteMapping("/logout")
    public ResponseEntity<?> logout(
            @SessionAttribute(value = "user", required = false) UserDTO userDto,
            HttpSession session) {
        userDto.setClientId(Optional.ofNullable(null));
        userDto.setRole(Role.USER);
        return ResponseEntity.ok().body(Map.of(
                "redirectUrl", "/"));
    }

}
