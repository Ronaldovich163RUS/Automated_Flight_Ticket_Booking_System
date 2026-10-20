package com.transfer.fasticket.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("seat_structure")
public class SeatStructure {
    @Id
    private Integer seatStructureId;
    private Integer cabinStructureId;
    private Integer row;
    private String seat;
}
