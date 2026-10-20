package com.transfer.fasticket.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Optional;

@Data
@NoArgsConstructor
public class LoginDTO {
    String login;
    String password;
}
