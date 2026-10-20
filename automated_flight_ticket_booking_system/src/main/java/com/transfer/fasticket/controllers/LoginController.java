package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.ClientDTO;
import com.transfer.fasticket.dto.LoginDTO;
import com.transfer.fasticket.dto.Role;
import com.transfer.fasticket.dto.UserDTO;
import com.transfer.fasticket.exceptions.ClientNotFoundException;
import com.transfer.fasticket.exceptions.LoginFailedException;
import com.transfer.fasticket.services.LoginService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.annotation.SessionScope;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Controller
//@SessionAttributes("userDto")
@RequestMapping("/login")
public class LoginController {
    @Autowired
    LoginService loginService;

    /*
    @GetMapping
    public String getLogin(Model model){
        model.addAttribute("clientLoginDto", new LoginDTO());
        return "login";
    }

    @PostMapping
    public String login(
            @Valid @ModelAttribute("clientLoginDto") LoginDTO loginDTO,
            BindingResult bindingResult,
            Model model) {

        if (bindingResult.hasErrors()) {
            return "login";
        }

        try {
            UserDTO userDto = loginService.loginClient(loginDTO);
            model.addAttribute("userDto", userDto); // Добавляем в сессию
            return "redirect:/account";

        } catch (ClientNotFoundException e) {
            bindingResult.rejectValue("login", "error.clientLoginDto", e.getMessage());
            return "login";

        } catch (LoginFailedException e) {
            bindingResult.rejectValue("password", "error.clientLoginDto", e.getMessage());
            return "login";
        }
    }
     */

    @GetMapping
    public String getView(
            HttpSession session,
            Model model
    ){
        Optional<UserDTO> userDto = Optional.ofNullable(
                (UserDTO) session.getAttribute("user"));
        if (userDto.isEmpty()) {
            session.setAttribute("user", new UserDTO());
            model.addAttribute("profile", "");
            return "login";
        }
        else if (userDto.get().getRole() == Role.CLIENT){
            return "redirect:/account";
        }
        else if (userDto.get().getRole() == Role.ADMIN){
            return "redirect:/flights";
        }
        else {
            model.addAttribute("loginDto", new LoginDTO());
            return "login";
        }
    }

    /*
    @PostMapping
    @ResponseBody
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
                    .header("redirectUrl", "/login")
                    .build();
        } catch (LoginFailedException e) {
            return ResponseEntity.badRequest()
                    .header("errorType", "passwordError")
                    .header("errorMessage", e.getMessage())
                    .header("redirectUrl", "/login")
                    .build();
        }
    }
     */


    @PostMapping
    @ResponseBody
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody @Valid LoginDTO loginDTO,
            BindingResult bindingResult,
            HttpSession session) {


        // Валидация DTO
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "errorType", "validationError",
                            "message", bindingResult.getFieldError().getDefaultMessage()
                    ));
        }


        try {
            UserDTO userDto = loginService.loginClient(loginDTO);
            session.setAttribute("user", userDto);
            System.out.println(userDto);

            // Динамический редирект по роли
            String redirectUrl = userDto.getRole() == Role.ADMIN
                    ? "/"
                    : "/account";

            return ResponseEntity.ok()
                    .body(Map.of("redirectUrl", redirectUrl));

        } catch (ClientNotFoundException e) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "errorType", "loginError",
                            "message", "Пользователь не найден"
                    ));

        } catch (LoginFailedException e) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "errorType", "passwordError",
                            "message", "Неверный пароль"
                    ));
        }
    }
}
