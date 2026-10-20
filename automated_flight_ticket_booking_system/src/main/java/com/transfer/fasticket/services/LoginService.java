package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.ClientDTO;
import com.transfer.fasticket.dto.LoginDTO;
import com.transfer.fasticket.dto.UserDTO;
import com.transfer.fasticket.exceptions.ClientNotFoundException;
import com.transfer.fasticket.exceptions.LoginFailedException;
import com.transfer.fasticket.models.Client;
import com.transfer.fasticket.models.PersonalInformation;
import com.transfer.fasticket.repositories.ClientRepository;
import com.transfer.fasticket.repositories.PersonalInformationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class LoginService {
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private PersonalInformationRepository personalInformationRepository;


    @Transactional
    public UserDTO loginClient(LoginDTO loginDTO){
        UserDTO userDTO = new UserDTO();
        if (loginDTO.getLogin().equals("admin@airline.com") && loginDTO.getPassword().equals("admin123")){
            userDTO.setRole("ADMIN");
        }
        else{
            Optional<Client> client = clientRepository.findByLogin(loginDTO.getLogin());
            if (client.isEmpty()){
                throw new ClientNotFoundException("Клиента с таким номером или email не существует");
            }
            if (!loginDTO.getPassword().equals(client.get().getPassword())){
                throw new LoginFailedException("Неверный пароль");
            }
            userDTO.setRole("CLIENT");
            userDTO.setClientId(Optional.of(client.get().getClientId()));
        }
        return userDTO;


        /*
        Optional<Client> client = clientRepository.findByEmail(userDTO.getLogin());
        if (client.isEmpty()){
            client = clientRepository.findByPhoneNumber(userDTO.getLogin());
        }
        if (client.isEmpty()){
            throw new ClientNotFoundException("Клиента с таким номером или email не существует");
        }
        else {
            if (client.get().getPassword().equals(userDTO.getPassword())) {
                Optional<PersonalInformation> personalInformation =
                        personalInformationRepository.findByClientId(client.get().getPersonalInformationId());
                System.out.println(personalInformation.get().getDocument());
                return new ClientDTO(client.get(), personalInformation.get());
            }
            else {
                throw new LoginFailedException("Неверный пароль");
            }
        }

        //throw new LoginFailedException();
        //throw new ClientNotFoundException();
        //return client.map(value -> value.getPassword().equals(password)).orElse(false);

         */
    }
}
