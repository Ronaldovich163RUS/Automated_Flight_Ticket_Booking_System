package com.transfer.fasticket.dto;

import lombok.Data;

import java.util.List;

@Data
public class AirplaneDTO {
    private Integer airplaneId;
    private Integer brandId;
    private Integer model;
    private Integer range;
    private Integer numberOfPassages;
    private List<CabinStructureDTO> cabinStructures;

    @Data
    public static class CabinStructureDTO {
        private String serviceClass;
        private Integer numberOfRows;
        private Integer numberOfSeatsPerRow;
    }
}