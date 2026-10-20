package com.transfer.fasticket.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AdminFlightDTO {
    private Integer flightId;
    private String flightNumber;
    private String departureCity;
    private String destinationCity;
    private LocalDate departureDate;
    private LocalTime departureTime;
    private Integer airplaneId;
    private Integer airlineId;
    private Integer brandId;
    private LocalTime flightDuration;
}