package com.transfer.fasticket.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("city")
public class City {
    @Id
    private Integer cityId;
    private String name;
    private Integer distance;
}
