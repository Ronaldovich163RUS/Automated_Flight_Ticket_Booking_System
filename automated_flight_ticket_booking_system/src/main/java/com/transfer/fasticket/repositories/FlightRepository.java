package com.transfer.fasticket.repositories;

import com.transfer.fasticket.dto.FlightDTO;
import com.transfer.fasticket.models.City;
import com.transfer.fasticket.models.Flight;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

public interface FlightRepository extends CrudRepository<Flight, Integer> {
    @Query ("SELECT * FROM flight WHERE flight_ID = :id")
    Optional<Flight> findById(Integer id);

    @Query("""
        SELECT f.flight_number as flightNumber,
               f.departure_date as departureDate,
               f.departure_time as departureTime,
               TIME_TO_SEC(f.flight_duration) as flightDuration,
               dep.name as departureCity,
               dest.name as destinationCity,
               MIN(s.price) as minPrice
        FROM flight f
        JOIN city dep ON f.departure_city_ID = dep.city_ID
        JOIN city dest ON f.destination_city_ID = dest.city_ID
        LEFT JOIN seat s ON f.flight_number = s.flight_number AND s.taken = 0
        GROUP BY f.flight_number
        HAVING minPrice IS NOT NULL
    """)
    List<FlightDTO> findAllAvailableFlights();

    @Query ("SELECT * FROM flight WHERE flight_number = :flightNumber")
    Optional<Flight> findByFlightNumber(String flightNumber);

    @Query("SELECT f.* FROM flight f " +
            "JOIN city dc ON f.departure_city_id = dc.city_id " +
            "JOIN city ac ON f.destination_city_id = ac.city_id " +
            "WHERE (:departureCity IS NULL OR dc.name = :departureCity) " +
            "AND (:destinationCity IS NULL OR ac.name = :destinationCity) " +
            "AND (:departureDate IS NULL OR f.departure_date = :departureDate)")
    List<Flight> findByDepartureCityAndDestinationCityAndDepartureDate(
            @Param("departureCity") String departureCity,
            @Param("destinationCity") String destinationCity,
            @Param("departureDate") Date departureDate);

    @Query("SELECT * FROM flight WHERE airplane_id = :airplaneId")
    List<Flight> findByAirplaneId(@Param("airplaneId") Integer airplaneId);

    @Query("SELECT airplane_ID FROM flight WHERE flight_ID = :flightId")
    Optional<Integer> findAirplaneIdById(Integer flightId);
}
