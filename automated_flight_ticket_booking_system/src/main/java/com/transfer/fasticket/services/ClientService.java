package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.ClientDTO;
import com.transfer.fasticket.dto.ClientResponseDTO;
import com.transfer.fasticket.dto.ContactDTO;
import com.transfer.fasticket.models.Booking;
import com.transfer.fasticket.models.Client;
import com.transfer.fasticket.models.PersonalInformation;
import com.transfer.fasticket.models.Ticket;
import com.transfer.fasticket.models.enums.Citizenship;
import com.transfer.fasticket.models.enums.Gender;
import com.transfer.fasticket.repositories.BookingRepository;
import com.transfer.fasticket.repositories.ClientRepository;
import com.transfer.fasticket.repositories.PersonalInformationRepository;
import com.transfer.fasticket.repositories.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class ClientService {
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private PersonalInformationRepository personalInformationRepository;
    @Autowired
    BookingRepository bookingRepository;
    @Autowired
    TicketRepository ticketRepository;

    @Transactional
    public ClientDTO getClientById(Integer id) {
        Optional<Client> client = clientRepository.findById(id);
        Optional<PersonalInformation> personalInformation = personalInformationRepository
                .findByClientId(client.get().getPersonalInformationId());
        return new ClientDTO(client.get(), personalInformation.get());
    }

    @Transactional
    public Optional<String> getEmailById(Integer id) {
        return clientRepository.findEmailById(id);
    }

    @Transactional
    public ContactDTO getContactById(Integer id) {
        Optional<Client> client = clientRepository.findById(id);
        ContactDTO contactDTO = new ContactDTO();
        contactDTO.setEmail(client.get().getEmail());
        contactDTO.setPhoneNumber(client.get().getPhoneNumber());
        return contactDTO;
    }

    public List<ClientResponseDTO> getAllClients() {
        return StreamSupport.stream(clientRepository.findAll().spliterator(), false)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ClientResponseDTO addClient(ClientDTO clientDTO) {
        // Сначала сохраняем персональную информацию
        PersonalInformation personalInfo = new PersonalInformation();
        personalInfo.setLastName(clientDTO.getLastName());
        personalInfo.setFirstName(clientDTO.getFirstName());
        personalInfo.setMiddleName(clientDTO.getMiddleName());
        personalInfo.setGender(Gender.valueOf(clientDTO.getGender().name().toLowerCase()));
        personalInfo.setDateOfBirth(clientDTO.getDateOfBirth());
        personalInfo.setDocumentNumber(clientDTO.getDocumentNumber());
        personalInfo.setDocument(clientDTO.getDocument());
        personalInfo.setCitizenship(Citizenship.valueOf(clientDTO.getCitizenship().name().toLowerCase()));

        PersonalInformation savedPersonalInfo = personalInformationRepository.save(personalInfo);

        // Затем сохраняем клиента
        Client client = new Client();
        client.setPersonalInformationId(savedPersonalInfo.getPersonalInformationId());
        client.setEmail(clientDTO.getEmail());
        client.setPhoneNumber(clientDTO.getPhoneNumber());
        client.setPassword(clientDTO.getPassword());

        Client savedClient = clientRepository.save(client);

        return convertToDTO(savedClient);
    }

    public List<ClientResponseDTO> searchClients(String lastName, String firstName, String documentNumber) {
        // Используем StreamSupport для преобразования Iterable в Stream
        return StreamSupport.stream(clientRepository.findAll().spliterator(), false)
                .filter(client -> {
                    PersonalInformation info = personalInformationRepository.findById(client.getPersonalInformationId())
                            .orElse(null);
                    if (info == null) return false;

                    boolean matches = true;
                    if (lastName != null && !lastName.isEmpty() &&
                            !info.getLastName().toLowerCase().contains(lastName.toLowerCase())) {
                        matches = false;
                    }
                    if (firstName != null && !firstName.isEmpty() &&
                            !info.getFirstName().toLowerCase().contains(firstName.toLowerCase())) {
                        matches = false;
                    }
                    if (documentNumber != null && !documentNumber.isEmpty() &&
                            !String.valueOf(info.getDocumentNumber()).contains(documentNumber)) {
                        matches = false;
                    }
                    return matches;
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteClient(Integer id) {
        // 1. Находим клиента
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        // 2. Находим все бронирования клиента
        List<Booking> clientBookings = bookingRepository.findByClientId(id);

        // 3. Для каждого бронирования находим и удаляем связанные билеты
        for (Booking booking : clientBookings) {
            List<Ticket> bookingTickets = ticketRepository.findByBookingId(booking.getBookingId());
            ticketRepository.deleteAll(bookingTickets);
        }

        // 4. Удаляем все бронирования клиента
        bookingRepository.deleteAll(clientBookings);

        // 5. Удаляем самого клиента
        clientRepository.delete(client);

        // 6. Удаляем персональную информацию клиента
        personalInformationRepository.deleteById(client.getPersonalInformationId());
    }

    private ClientResponseDTO convertToDTO(Client client) {
        PersonalInformation personalInfo = personalInformationRepository.findById(client.getPersonalInformationId())
                .orElseThrow(() -> new RuntimeException("Personal information not found"));

        ClientResponseDTO dto = new ClientResponseDTO();
        dto.setId(client.getClientId());
        dto.setLastName(personalInfo.getLastName());
        dto.setFirstName(personalInfo.getFirstName());
        dto.setMiddleName(personalInfo.getMiddleName());
        dto.setGender(personalInfo.getGender());
        dto.setBirthDate(personalInfo.getDateOfBirth().toLocalDate());
        dto.setDocumentNumber(String.valueOf(personalInfo.getDocumentNumber()));
        dto.setDocument(personalInfo.getDocument().name().toLowerCase());
        dto.setEmail(client.getEmail());
        dto.setPhone(client.getPhoneNumber());
        dto.setCitizenship(personalInfo.getCitizenship());

        return dto;
    }

}
