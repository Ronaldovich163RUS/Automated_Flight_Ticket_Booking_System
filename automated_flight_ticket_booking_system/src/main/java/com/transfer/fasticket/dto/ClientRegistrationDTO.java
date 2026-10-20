package com.transfer.fasticket.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.sql.Date;

@Data
public class ClientRegistrationDTO {
    @NotBlank(message = "Телефон обязателен")
    @Pattern(regexp = "^\\+7\\d{10}$", message = "Формат: +7XXXXXXXXXX")
    private String phoneNumber;

    @NotBlank(message = "Email обязателен")
    @Email(message = "Некорректный email")
    private String email;

    @NotBlank(message = "Пароль обязателен")
    @Size(min = 8, message = "Минимум 8 символов")
    private String password;

    @NotBlank(message = "Подтверждение пароля обязательно")
    @Size(min = 8, message = "Минимум 8 символов")
    private String confirmPassword;

    // Personal Information fields
    @NotBlank(message = "Фамилия обязательна")
    private String lastName;

    @NotBlank(message = "Имя обязательно")
    private String firstName;

    private String middleName;

    @NotNull(message = "Дата рождения обязательна")
    //@Past(message = "Некорректная дата рождения")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$", message = "Формат: гггг-мм-дд")
    private String dateOfBirth;
}
