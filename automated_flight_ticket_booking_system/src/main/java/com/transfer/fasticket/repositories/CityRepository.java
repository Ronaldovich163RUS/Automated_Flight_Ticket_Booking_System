package com.transfer.fasticket.repositories;

import com.transfer.fasticket.models.City;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends CrudRepository<City, Integer> {
    @Query("SELECT name FROM city WHERE name <> \"Самара\"")
    Iterable<String> findAllNamesExceptSamara();

    @Query("SELECT name FROM city")
    Iterable<String> findAllNames();

    @Query("SELECT name FROM city WHERE city_ID = :id")
    Optional<String> findNameById(Integer id);

    Optional<City> findByName(String name);
}
