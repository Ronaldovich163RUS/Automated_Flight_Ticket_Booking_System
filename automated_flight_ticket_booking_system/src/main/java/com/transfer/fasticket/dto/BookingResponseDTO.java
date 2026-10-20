package com.transfer.fasticket.dto;

import lombok.Data;

@Data
public class BookingResponseDTO {
    private Integer bookingId;
    private Integer clientId;
    private Integer flightId;
    private String flightNumber;
    private Integer baggageCount;
    private Double totalCost;
}