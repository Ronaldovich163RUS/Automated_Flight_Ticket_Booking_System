package com.transfer.fasticket.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdminTicketDTO {
    private Integer ticketId;
    private Integer personalInformationId;
    private Integer bookingId;
    private Integer seatId;

    // Additional fields for display
    private String passengerName;
    private String flightNumber;
    private String departureCity;
    private String destinationCity;
    private String departureDate;
    private String departureTime;
    private String seatNumber;
    private String serviceClass;
    private Integer passengerAge;
    private BigDecimal price;
}