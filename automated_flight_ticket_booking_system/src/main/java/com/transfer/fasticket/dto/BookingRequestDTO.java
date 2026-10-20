package com.transfer.fasticket.dto;

import lombok.Data;

import java.util.List;

@Data
public class BookingRequestDTO {
    List<PassengerDTO> passengers;
    Integer baggageCount;
    Boolean hasClientAsPassenger;
    Boolean isRoundTrip;
    Integer outboundFlightId;
    Integer returnFlightId;
    List<Object> seats;
    Double totalCost;
} 