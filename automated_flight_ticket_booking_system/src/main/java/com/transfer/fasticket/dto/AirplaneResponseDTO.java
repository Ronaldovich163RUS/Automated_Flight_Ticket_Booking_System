package com.transfer.fasticket.dto;

import lombok.Data;

import java.util.List;

@Data
public class AirplaneResponseDTO {
    private Integer airplaneId;
    private Integer brandId;
    private Integer model;
    private Integer range;
    private Integer numberOfPassages;
    private String brand;
    private String airline;
    private List<CabinStructureDTO> cabinStructures;

    @Data
    public static class CabinStructureDTO {
        private String serviceClass;
        private Integer numberOfRows;
        private Integer numberOfSeatsPerRow;
    }
}