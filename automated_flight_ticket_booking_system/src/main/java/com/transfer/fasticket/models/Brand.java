package com.transfer.fasticket.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("brand")
public class Brand {
    @Id
    private Integer brandId;
    private String name;
    private Integer airlineId;
}
