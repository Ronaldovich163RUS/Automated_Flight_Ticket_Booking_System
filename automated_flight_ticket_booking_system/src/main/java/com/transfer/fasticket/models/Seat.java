package com.transfer.fasticket.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("seat")
public class Seat {
    @Id
    private Integer seatId;
    private Integer flightId;
    private Integer seatStructureId;
    private Double price;
    private Boolean taken;
}
