package com.transfer.fasticket.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("cabin_structure")
public class CabinStructure {
    @Id
    private Integer cabinStructureId;
    private Integer airplaneId;
    private Integer serviceClassId;
    private Integer numberOfRows;
    private Integer numberOfSeatsPerRow;
}
