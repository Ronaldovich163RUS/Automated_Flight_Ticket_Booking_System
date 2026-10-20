package com.transfer.fasticket.dto;

import com.transfer.fasticket.models.enums.Citizenship;
import com.transfer.fasticket.models.enums.Document;
import com.transfer.fasticket.models.enums.Gender;
import lombok.Data;

import java.sql.Date;

@Data
public class PassengerDTO {
    private String lastName;
    private String firstName;
    private String middleName;
    private Gender gender;
    private Date dateOfBirth;
    private Document document;
    private String documentSeries;
    private Integer documentNumber;
    private Citizenship citizenship;
}
