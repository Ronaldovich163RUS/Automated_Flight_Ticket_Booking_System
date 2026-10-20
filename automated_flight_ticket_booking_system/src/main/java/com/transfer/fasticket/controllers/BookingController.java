package com.transfer.fasticket.controllers;

import com.transfer.fasticket.dto.*;
import com.transfer.fasticket.models.Booking;
import com.transfer.fasticket.models.Flight;
import com.transfer.fasticket.services.BookingService;
import com.transfer.fasticket.services.ClientService;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/booking")
public class BookingController {
    @Autowired
    ClientService clientService;

    @Autowired
    BookingService bookingService;

    /*
    @GetMapping
    public String getView(
            HttpSession session,
            Model model
    ){
        UserDTO userDTO = (UserDTO)session.getAttribute("userDto");
        FlightDTO flight = (FlightDTO)session.getAttribute("flightOneWay");
        model.addAttribute("flightOneWay");
        ContactDTO contact = clientService.getContactById(userDTO.getClientId().get());
        model.addAttribute("contact", contact);
        return "redirect:/booking";
    }

    @PostMapping
    @ResponseBody
    public ResponseEntity<?> bookingClient(
            @RequestBody List<TicketDTO> tickets,
            HttpSession session
            ){
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{flightId}")
    public String showBookingPage(@PathVariable Integer flightId, Model model) {
        Optional<Flight> flightOptional = bookingService.getFlightById(flightId);
        if (flightOptional.isEmpty()) {
            return "redirect:/flights";
        }
        model.addAttribute("flight", flightOptional.get());
        return "booking";
    }

    @PostMapping("/create")
    public String createBooking(
        @RequestBody BookingRequest request
        ) {
        try {
            Booking booking = bookingService.createBooking(request);
            return String.valueOf(booking.getBookingId());
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
     */

    @GetMapping
    public String getView(
            HttpSession session,
            Model model
    ){
        Optional<UserDTO> userDto = Optional.ofNullable(
                (UserDTO) session.getAttribute("user"));
        if (userDto.isEmpty()) {
            session.setAttribute("user", new UserDTO());
            model.addAttribute("profile", "");
            return "redirect:/login";
        }
        else if (userDto.get().getRole() == Role.CLIENT){
            model.addAttribute("profile",
                    clientService.getEmailById(userDto.get().getClientId().get()).get());
            Integer outboundFlightId = (Integer)session.getAttribute("outboundFlightId");
            FlightDTO outboundFlightDTO = bookingService.getFlightById(outboundFlightId);
            model.addAttribute("outboundFlight", outboundFlightDTO);
            Boolean isRoundTrip = (Boolean) session.getAttribute("isRoundTrip");
            if (isRoundTrip){
                Integer returnFlightId = (Integer)session.getAttribute("returnFlightId");
                FlightDTO returnFlightDTO = bookingService.getFlightById(returnFlightId);
                model.addAttribute("returnFlight", returnFlightDTO);
            }
            model.addAttribute("isRoundTrip", isRoundTrip);
            ContactDTO contact = bookingService.getContactById(userDto.get().getClientId().get());
            model.addAttribute("contact", contact);
            Optional<SeatsInfoDTO> seatsInfoDTO = Optional.ofNullable((SeatsInfoDTO)session.getAttribute("seatsInfo"));
            if (seatsInfoDTO.isPresent()) {
                System.out.println("в booking");
                System.out.println(seatsInfoDTO.get());
                model.addAttribute("seatsInfo", seatsInfoDTO.get());
            }
            else {
                System.out.println("в booking null");
                model.addAttribute("seatsInfo", null);
            }
            Integer passengers = (Integer) session.getAttribute("passengers");
            model.addAttribute("passengers", passengers);
            return "booking";
        }
        else{
            return "redirect:/login";
        }
    }


    @GetMapping("/client-information")
    @ResponseBody
    public ResponseEntity<?> getClientInformation(
            HttpSession session
    ){
        Integer clientId = ((UserDTO)session.getAttribute("user")).getClientId().get();
        ClientDTO client = clientService.getClientById(clientId);
        return ResponseEntity.ok().body(Map.of(
                "lastName", client.getLastName(),
                "firstName", client.getFirstName(),
                "middleName", client.getMiddleName(),
                "gender", client.getGender(),
                "dateOfBirth", client.getDateOfBirth(),
                "document", client.getDocument(),
                "documentSeries", client.getDocumentSeries(),
                "documentNumber", client.getDocumentNumber(),
                "citizenship", client.getCitizenship()
        ));
        /*
        if (client.getLastName() == null ||
                client.getFirstName() == null ||
                client.getMiddleName() == null ||
                client.getGender() == null ||
                client.getDateOfBirth() == null ||
                client.getDocument() == null ||
                client.getDocumentSeries() == null ||
                client.getDocumentNumber() == null ||
                client.getCitizenship() == null){
            return ResponseEntity.status(409).body(Map.of(
                    "error", "Данные в личном кабинете заполнены не полностью"));
        }
        else {
            return ResponseEntity.ok().body(Map.of(
                    "lastName", client.getLastName(),
                            "firstName", client.getFirstName(),
                            "middleName", client.getMiddleName(),
                            "gender", client.getGender(),
                            "dateOfBirth", client.getDateOfBirth(),
                            "document", client.getDocument(),
                            "documentSeries", client.getDocumentSeries(),
                            "documentNumber", client.getDocumentNumber(),
                            "citizenship", client.getCitizenship()
            ));
        }
         */
    }

    @PostMapping
    @ResponseBody
    public ResponseEntity<?> booking(
            @RequestBody BookingRequestDTO bookingRequestDTO,
            HttpSession session
    ){
        System.out.println(bookingRequestDTO);
        Integer clientId = ((UserDTO)session.getAttribute("user")).getClientId().get();
        try {
            bookingService.setBooking(bookingRequestDTO, clientId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            // Логируем исключение для отладки на сервере
            System.err.println("Ошибка при бронировании: " + e.getMessage());
            // Возвращаем сообщение об ошибке на фронтенд
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("seat-selection")
    @ResponseBody
    public ResponseEntity<?> seatSelection(
            @RequestBody FromBookingToSelectSeatsDTO parameters,
            HttpSession session
    ){
        System.out.println(parameters);
        session.setAttribute("fromBookingToSelectSeats", parameters);
        return ResponseEntity.ok().build();
    }
}
