package com.transfer.fasticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CabinStructureDTO {
    Integer cabinStructureID;
    String serviceClass;
    Integer numberOfRows;
    Integer numberOfSeatsPerRow;
    //List<SeatDTO> seatStructure = null;
}
