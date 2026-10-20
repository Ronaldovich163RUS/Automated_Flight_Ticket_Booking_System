package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.AirlineDTO;
import com.transfer.fasticket.repositories.AirlineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AirlineService {
    private final AirlineRepository airlineRepository;

    @Autowired
    public AirlineService(AirlineRepository airlineRepository) {
        this.airlineRepository = airlineRepository;
    }

    public List<AirlineDTO> getAllAirlines() {
        List<AirlineDTO> airlines = new ArrayList<>();
        airlineRepository.findAll().forEach(airline -> {
            AirlineDTO dto = new AirlineDTO();
            dto.setAirlineId(airline.getAirlineId());
            dto.setName(airline.getName());
            dto.setPricePerKm(airline.getPricePerKm());
            airlines.add(dto);
        });
        return airlines;
    }
} 