package com.transfer.fasticket.models;

import com.transfer.fasticket.models.enums.Citizenship;
import com.transfer.fasticket.models.enums.Document;
import com.transfer.fasticket.models.enums.Gender;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.sql.Date;

@Data
@Table("personal_information")
public class PersonalInformation {
    @Id
    private Integer personalInformationId;
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
