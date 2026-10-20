package com.transfer.fasticket.dto;

import com.transfer.fasticket.models.enums.Citizenship;
import com.transfer.fasticket.models.enums.Gender;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ClientResponseDTO {
    private Integer id;
    private String lastName;
    private String firstName;
    private String middleName;
    private Gender gender;
    private LocalDate birthDate;
    private String documentNumber;
    private String document;
    private String email;
    private String phone;
    private Citizenship citizenship;
    private Integer absoluteRowNumber;
    private Integer row;
    private Character seatLetter;
    private String serviceClass;
}