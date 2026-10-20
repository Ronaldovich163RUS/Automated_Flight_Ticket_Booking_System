package com.transfer.fasticket.repositories;

import com.transfer.fasticket.models.Brand;
import com.transfer.fasticket.models.City;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface BrandRepository extends CrudRepository<Brand, Integer> {
    List<Brand> findByAirlineId(Integer airlineId);
}
