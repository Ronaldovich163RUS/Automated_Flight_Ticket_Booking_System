package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.BrandDTO;
import com.transfer.fasticket.repositories.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BrandService {
    private final BrandRepository brandRepository;

    @Autowired
    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public List<BrandDTO> getBrandsByAirlineId(Integer airlineId) {
        List<BrandDTO> brands = new ArrayList<>();
        brandRepository.findByAirlineId(airlineId).forEach(brand -> {
            BrandDTO dto = new BrandDTO();
            dto.setBrandId(brand.getBrandId());
            dto.setName(brand.getName());
            dto.setAirlineId(brand.getAirlineId());
            brands.add(dto);
        });
        return brands;
    }
} 