package com.transfer.fasticket.dto;

import lombok.Data;

@Data
public class SeatDTO {
    Integer row;
    Character seat;
    //Double price;
    Boolean taken;
}
