package com.transfer.fasticket.models;

import com.transfer.fasticket.models.enums.Citizenship;
import com.transfer.fasticket.models.enums.Document;
import com.transfer.fasticket.models.enums.Gender;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.sql.Date;

@Data
@Table("client")
public class Client {
    @Id
    private Integer clientId;
    private Integer personalInformationId;
    private String email;
    private String phoneNumber;
    private String password;
}
