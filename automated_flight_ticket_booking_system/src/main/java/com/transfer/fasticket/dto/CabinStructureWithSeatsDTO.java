package com.transfer.fasticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CabinStructureWithSeatsDTO {
    Integer cabinStructureID;
    String serviceClass;
    Integer numberOfRows;
    Integer numberOfSeatsPerRow;
    Double price;
    List<SeatDTO> seatStructure;
}
