package com.transfer.fasticket.repositories;

import com.transfer.fasticket.models.Airplane;
import com.transfer.fasticket.models.City;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AirplaneRepository extends CrudRepository<Airplane, Integer> {

    @Query("SELECT a.* FROM airplane a " +
            "JOIN brand b ON a.brand_ID = b.brand_ID " +
            "JOIN airline al ON b.airline_ID = al.airline_ID " +
            "WHERE CAST(a.model AS VARCHAR) LIKE CONCAT('%', :model, '%') " +
            "AND b.name LIKE CONCAT('%', :brand, '%') " +
            "AND al.name LIKE CONCAT('%', :airline, '%')")
    List<Airplane> findByModelBrandAndAirline(@Param("model") String model,
                                              @Param("brand") String brand,
                                              @Param("airline") String airline);

    Optional<Airplane> findByModel(Integer model);

    List<Airplane> findByBrandId(Integer brandId);

    @Query("SELECT a.* FROM airplane a JOIN brand b ON a.brand_ID = b.brand_ID WHERE a.model = :model AND a.brand_ID = :brandId AND b.airline_ID = :airlineId")
    List<Airplane> findByModelAndBrandIdAndAirlineId(@Param("model") Integer model, @Param("brandId") Integer brandId,
                                                     @Param("airlineId") Integer airlineId);

    @Query("INSERT INTO airplane (airplane_ID, brand_ID, model, `range`, number_of_passages) VALUE\n" +
            "(:airplaneId, :brandId, :model, :range, :numberOfPassages)")
    @Modifying
    void insertById(Integer airplaneId, Integer brandId, Integer model, Integer range, Integer numberOfPassages);
}
