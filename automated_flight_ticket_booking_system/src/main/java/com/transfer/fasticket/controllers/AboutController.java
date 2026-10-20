package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.Role;
import com.transfer.fasticket.dto.UserDTO;
import com.transfer.fasticket.services.CityService;
import com.transfer.fasticket.services.ClientService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/about")
public class AboutController {
    @Autowired
    ClientService clientService;
    @GetMapping
    public String getView(
            HttpSession session,
            Model model
    ) {
        Optional<UserDTO> userDto = Optional.ofNullable(
                (UserDTO) session.getAttribute("user"));
        if (userDto.isEmpty()) {
            session.setAttribute("user", new UserDTO());
            model.addAttribute("profile", "");
        } else if (userDto.get().getRole() == Role.CLIENT) {
            model.addAttribute("profile",
                    clientService.getEmailById(userDto.get().getClientId().get()).get());
        } else if (userDto.get().getRole() == Role.ADMIN) {
            model.addAttribute("profile", "admin");
        } else {
            model.addAttribute("profile", "");
        }
        return "about";
    }

}
