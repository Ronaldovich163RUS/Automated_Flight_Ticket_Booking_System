package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.ClientRegistrationDTO;
import com.transfer.fasticket.exceptions.*;
import com.transfer.fasticket.models.Client;
import com.transfer.fasticket.models.PersonalInformation;
import com.transfer.fasticket.repositories.ClientRepository;
import com.transfer.fasticket.repositories.PersonalInformationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class RegistrationService {
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private PersonalInformationRepository personalInfoRepository;

    @Transactional
    public void registerNewClient(ClientRegistrationDTO dto) {

        if (clientRepository.existsByPhoneNumber(dto.getPhoneNumber())) {
            throw new DuplicatePhoneNumberException("Номер телефона уже используется");
        }

        // Проверка уникальности
        if (clientRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateEmailException("Email уже зарегистрирован");
        }

        // Сохранение персональных данных
        PersonalInformation personalInfo = new PersonalInformation();
        personalInfo.setLastName(dto.getLastName());
        personalInfo.setFirstName(dto.getFirstName());
        personalInfo.setMiddleName(dto.getMiddleName());
        personalInfo.setDateOfBirth(convertDate(dto.getDateOfBirth()));
        PersonalInformation savedPersonalInfo = personalInfoRepository.save(personalInfo);

        // Создание клиента
        Client client = new Client();
        client.setEmail(dto.getEmail());
        client.setPhoneNumber(dto.getPhoneNumber());
        client.setPassword(dto.getPassword()); // В реальности нужно хеширование
        client.setPersonalInformationId(savedPersonalInfo.getPersonalInformationId());

        clientRepository.save(client);
    }

    private Date convertDate(String row){
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return Date.valueOf(LocalDate.parse(row, dateTimeFormatter));
    }
}
