package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.ClientDTO;
import com.transfer.fasticket.exceptions.DuplicateEmailException;
import com.transfer.fasticket.exceptions.DuplicatePhoneNumberException;
import com.transfer.fasticket.models.Client;
import com.transfer.fasticket.models.PersonalInformation;
import com.transfer.fasticket.repositories.ClientRepository;
import com.transfer.fasticket.repositories.PersonalInformationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AccountService {
    @Autowired
    ClientRepository clientRepository;
    @Autowired
    PersonalInformationRepository personalInformationRepository;
    @Transactional
    public void deleteClient(Integer clientId){
        Optional<Client> client = clientRepository.findById(clientId);
        Optional<PersonalInformation> personalInformation =
                personalInformationRepository.findByClientId(client.get().getPersonalInformationId());
        System.out.println(client.toString());
        System.out.println(personalInformation.toString());
        personalInformationRepository.deleteById(personalInformation.get().getPersonalInformationId());
    }

    @Transactional
    public void updateClient(Integer clientId, ClientDTO clientDto){
        // Проверка уникальности
        if (clientRepository.existsByEmailExceptCurrentClient(clientId, clientDto.getEmail())){
            throw new DuplicateEmailException("Email уже зарегистрирован");
        }
        if (clientRepository.existsByPhoneNumberExceptCurrentClient(clientId,
                clientDto.getPhoneNumber())) {
            throw new DuplicatePhoneNumberException("Номер телефона уже используется");
        }

        clientRepository.updateById(clientId, clientDto.getEmail(),
                clientDto.getPhoneNumber(), clientDto.getPassword());
        Optional<Integer> personalInformationId =
                clientRepository.findPersonalInformationIdByClientId(clientId);
        personalInformationRepository.updateById(personalInformationId.get(),
                clientDto.getLastName(), clientDto.getFirstName(), clientDto.getMiddleName(),
                clientDto.getGender(), clientDto.getDateOfBirth(), clientDto.getDocument(),
                clientDto.getDocumentSeries(), clientDto.getDocumentNumber(), clientDto.getCitizenship());
    }
}
