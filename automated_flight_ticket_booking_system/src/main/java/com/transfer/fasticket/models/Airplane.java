package com.transfer.fasticket.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("airplane")
public class Airplane {
    @Id
    private Integer airplaneId;
    private Integer brandId;
    private Integer model;
    private Integer range;
    private Integer numberOfPassages;
}
