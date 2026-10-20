package com.transfer.fasticket.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("booking")
public class Booking {
    @Id
    private Integer bookingId;
    private Integer clientId;
    private Integer baggageCount;
    private Integer flightId;
    private Double totalCost;

    public Booking(Integer clientId,
           Integer baggageCount,
           Integer flightId,
           Double totalCost){
        this.clientId = clientId;
        this.baggageCount = baggageCount;
        this.flightId = flightId;
        this.totalCost = totalCost;
    }
}
