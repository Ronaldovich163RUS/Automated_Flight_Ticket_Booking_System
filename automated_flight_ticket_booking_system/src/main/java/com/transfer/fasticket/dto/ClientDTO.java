package com.transfer.fasticket.dto;

import com.transfer.fasticket.models.enums.Citizenship;
import com.transfer.fasticket.models.enums.Document;
import com.transfer.fasticket.models.enums.Gender;
import com.transfer.fasticket.models.Client;
import com.transfer.fasticket.models.PersonalInformation;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;

@Data
@NoArgsConstructor
public class ClientDTO {
    private String lastName;
    private String firstName;
    private String middleName;
    private String email;
    private String phoneNumber;
    private String password;
    private Gender gender;
    private Date dateOfBirth;
    private Document document;
    private String documentSeries;
    private Integer documentNumber;
    private Citizenship citizenship;

    public ClientDTO(Client client, PersonalInformation personalInformation){
        this.lastName = personalInformation.getLastName();
        this.firstName = personalInformation.getFirstName();
        this.middleName = personalInformation.getMiddleName();
        this.email = client.getEmail();
        this.phoneNumber = client.getPhoneNumber();
        this.password = client.getPassword();
        this.gender = personalInformation.getGender();
        this.dateOfBirth = personalInformation.getDateOfBirth();
        this.document = personalInformation.getDocument();
        this.documentSeries = personalInformation.getDocumentSeries();
        this.documentNumber = personalInformation.getDocumentNumber();
        this.citizenship = personalInformation.getCitizenship();
    }
}
