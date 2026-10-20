package com.transfer.fasticket.dto;

import lombok.Data;

@Data
public class SeatStructureDTO {
    private Integer seatStructureId;
    private Integer cabinStructureId;
    private Integer row;
    private Character seat;
} 