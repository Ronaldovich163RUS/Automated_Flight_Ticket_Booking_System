package com.transfer.fasticket.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("service_class")
public class ServiceClass {
    @Id
    private Integer serviceClassId;
    private String name;
    private Double markupCoefficient;
}
