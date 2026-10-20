package com.transfer.fasticket.dto;


import java.util.List;

import lombok.Data;

@Data
public class SeatsInfoDTO {
    //Integer flightId,
    String type;
    Double price;
    Integer totalBaggageCount;
    List<?> seats;
}
