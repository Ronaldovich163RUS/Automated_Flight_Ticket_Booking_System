package com.transfer.fasticket.dto;

import com.transfer.fasticket.models.enums.Citizenship;
import com.transfer.fasticket.models.enums.Document;
import com.transfer.fasticket.models.enums.Gender;

import java.sql.Date;

public class TicketDTO {
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
