package com.transfer.fasticket.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class FlightResponseDTO {
    private Integer flightId;
    private String flightNumber;
    private String departureCity;
    private String destinationCity;
    private LocalDate departureDate;
    private LocalTime departureTime;
    private String airplaneModel;
    private String airlineName;
    private String brandName;
    private LocalTime flightDuration;
    private Integer availableSeats;
    private Integer airplaneId;
}