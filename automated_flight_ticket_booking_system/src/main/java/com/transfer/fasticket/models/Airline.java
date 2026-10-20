package com.transfer.fasticket.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("airline")
public class Airline {
    @Id
    private Integer airlineId;
    private String name;
    private Double pricePerKm;
}
