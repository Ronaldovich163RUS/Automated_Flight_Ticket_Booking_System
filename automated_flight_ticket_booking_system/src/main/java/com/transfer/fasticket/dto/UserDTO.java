package com.transfer.fasticket.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Optional;

@Data
public class UserDTO {
    Role role;
    Optional<Integer> clientId;

    public UserDTO(){
        role = Role.USER;
    }

    public void setRole(String role){
        if (role.equals("ADMIN")){
            this.role = Role.ADMIN;
        }
        else if (role.equals("CLIENT")){
            this.role = Role.CLIENT;
        }
        else {
            this.role = Role.USER;
        }
    }

    public void setRole(Role role){
        this.role = role;
    }
}
