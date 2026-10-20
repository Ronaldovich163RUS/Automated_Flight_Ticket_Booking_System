package com.transfer.fasticket.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdminSeatDTO {
    private Integer seatId;
    private Integer flightId;
    private Integer seatStructureId;
    private Double price;
    private Boolean taken;
    private String serviceClassName;
    private Integer row;
    private Character seat;
} 