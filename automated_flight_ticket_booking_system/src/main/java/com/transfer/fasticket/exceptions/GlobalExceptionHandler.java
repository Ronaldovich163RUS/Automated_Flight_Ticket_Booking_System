package com.transfer.fasticket.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    /*
    @ExceptionHandler(DuplicateEntityException.class)
    public String handleDuplicateEntity(DuplicateEntityException ex, Model model) {
        model.addAttribute("error", ex.getMessage());
        return "registration";
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public String handleDuplicateEmail(DuplicateEntityException ex, Model model) {
        model.addAttribute("duplicateEmail", ex.getMessage());
        //bindingResult.rejectValue("email", "error.clientRegistrationDto", ex.getMessage());
        return "registration";
    }

    @ExceptionHandler(DuplicatePhoneNumberException.class)
    public String handleDuplicatePhoneNumber(DuplicatePhoneNumberException ex, Model model) {
        model.addAttribute("duplicatePhoneNumber", ex.getMessage());
        //bindingResult.rejectValue("phoneNumber", "error.clientRegistrationDto", ex.getMessage());
        return "registration";
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "errorType", "serverError",
                        "message", "Internal Server Error"
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldError().getDefaultMessage();
        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "errorType", "validationError",
                        "message", errorMessage
                ));
    }

     */
}
