package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.ClientDTO;
import com.transfer.fasticket.dto.ClientResponseDTO;
import com.transfer.fasticket.services.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/clients")
public class ClientController {

    private final ClientService clientService;

    @Autowired
    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    // Метод для отображения HTML-страницы
    @GetMapping
    public String showClientsPage(Model model) {
        List<ClientResponseDTO> clients = clientService.getAllClients();
        model.addAttribute("clients", clients);
        return "clients"; // Возвращает имя шаблона (clients.html)
    }

    // REST API методы
    @GetMapping("/api")
    @ResponseBody
    public ResponseEntity<List<ClientResponseDTO>> getAllClients() {
        List<ClientResponseDTO> clients = clientService.getAllClients();
        return ResponseEntity.ok(clients);
    }

    @PostMapping("/api")
    @ResponseBody
    public ResponseEntity<ClientResponseDTO> addClient(@RequestBody ClientDTO clientDTO) {
        ClientResponseDTO responseDTO = clientService.addClient(clientDTO);
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/api/search")
    @ResponseBody
    public ResponseEntity<List<ClientResponseDTO>> searchClients(
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String documentNumber) {

        List<ClientResponseDTO> clients = clientService.searchClients(lastName, firstName, documentNumber);
        return ResponseEntity.ok(clients);
    }

    @DeleteMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteClient(@PathVariable Integer id) {
        clientService.deleteClient(id);
        return ResponseEntity.ok().build();
    }
}