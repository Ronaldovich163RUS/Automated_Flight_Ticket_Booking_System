package com.transfer.fasticket.repositories;

import com.transfer.fasticket.models.Airline;
import com.transfer.fasticket.models.City;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface AirlineRepository extends CrudRepository<Airline, Integer> {

    @Query("""
            SELECT airline.name FROM airline\s
            JOIN brand ON airline.airline_ID = brand.airline_ID
            JOIN airplane ON airplane.brand_ID = brand.brand_ID
            WHERE airplane_ID = :airplaneId
            """)
    Optional<String> findNameByAirplaneId(Integer airplaneId);

    Optional<Airline> findByName(String name);
}
