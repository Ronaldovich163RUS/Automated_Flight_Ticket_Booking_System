package com.transfer.fasticket.repositories;

import com.transfer.fasticket.models.City;
import com.transfer.fasticket.models.ServiceClass;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface ServiceClassRepository extends CrudRepository<ServiceClass, Integer> {
    Optional<ServiceClass> findByName(String name);
}
