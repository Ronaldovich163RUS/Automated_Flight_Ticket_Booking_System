package com.transfer.fasticket.dto;

import lombok.Data;

@Data
public class FromBookingToSelectSeatsDTO {
    Integer flightId;
    Integer passengers;
}
