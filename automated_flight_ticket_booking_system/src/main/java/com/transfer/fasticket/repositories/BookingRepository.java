package com.transfer.fasticket.repositories;

import com.transfer.fasticket.dto.BookingDTO;
import com.transfer.fasticket.models.Booking;
import com.transfer.fasticket.models.City;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.jdbc.repository.query.Query;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends CrudRepository<Booking, Integer> {

    @Query("""
            SELECT 
                b.booking_ID,
                f.departure_date,
                f.departure_time,
                f.flight_number,
                c1.`name` AS departure_city,
                c2.`name` AS destination_city,
                f.flight_duration AS duration,
                b.baggage_count AS luggage,
                b.total_cost AS price,
                cl.personal_information_ID,
                pi.first_name,
                pi.last_name,
                pi.middle_name,
                a.name AS airline_name,
                ADDTIME(f.departure_time, f.flight_duration) AS arrival_time
            FROM booking b
            JOIN flight f ON f.flight_ID = b.flight_ID
            JOIN city c1 ON c1.city_ID = f.departure_city_ID
            JOIN city c2 ON c2.city_ID = f.destination_city_ID
            JOIN airplane ap ON ap.airplane_ID = f.airplane_ID
            JOIN brand bd ON bd.brand_ID = ap.brand_ID
            JOIN airline a ON a.airline_ID = bd.airline_ID
            JOIN client cl ON cl.client_ID = b.client_ID
            JOIN personal_information pi ON pi.personal_information_ID = cl.personal_information_ID
            WHERE b.client_id = :clientId
            AND f.departure_date >= CURDATE()
            ORDER BY f.departure_date ASC, f.departure_time ASC
            """)
    List<BookingDTO> findCurrentBookingsByClientId(Integer clientId);

    @Query("""
            SELECT 
                b.booking_ID,
                f.departure_date,
                f.departure_time,
                f.flight_number,
                c1.`name` AS departure_city,
                c2.`name` AS destination_city,
                f.flight_duration AS duration,
                b.baggage_count AS luggage,
                b.total_cost AS price,
                cl.personal_information_ID,
                pi.first_name,
                pi.last_name,
                pi.middle_name,
                a.name AS airline_name,
                ADDTIME(f.departure_time, f.flight_duration) AS arrival_time
            FROM booking b
            JOIN flight f ON f.flight_ID = b.flight_ID
            JOIN city c1 ON c1.city_ID = f.departure_city_ID
            JOIN city c2 ON c2.city_ID = f.destination_city_ID
            JOIN airplane ap ON ap.airplane_ID = f.airplane_ID
            JOIN brand bd ON bd.brand_ID = ap.brand_ID
            JOIN airline a ON a.airline_ID = bd.airline_ID
            JOIN client cl ON cl.client_ID = b.client_ID
            JOIN personal_information pi ON pi.personal_information_ID = cl.personal_information_ID
            WHERE b.client_id = :clientId
            AND f.departure_date < CURDATE()
            ORDER BY f.departure_date DESC, f.departure_time DESC
            """)
    List<BookingDTO> findPastBookingsByClientId(Integer clientId);

    @Query("""
            SELECT 
                b.booking_ID,
                f.departure_date,
                f.departure_time,
                f.flight_number,
                c1.`name` AS departure_city,
                c2.`name` AS destination_city,
                f.flight_duration AS duration,
                b.baggage_count AS luggage,
                b.total_cost AS price,
                cl.personal_information_ID,
                pi.first_name,
                pi.last_name,
                pi.middle_name,
                a.name AS airline_name,
                ADDTIME(f.departure_time, f.flight_duration) AS arrival_time
            FROM booking b
            JOIN flight f ON f.flight_ID = b.flight_ID
            JOIN city c1 ON c1.city_ID = f.departure_city_ID
            JOIN city c2 ON c2.city_ID = f.destination_city_ID
            JOIN airplane ap ON ap.airplane_ID = f.airplane_ID
            JOIN brand bd ON bd.brand_ID = ap.brand_ID
            JOIN airline a ON a.airline_ID = bd.airline_ID
            JOIN client cl ON cl.client_ID = b.client_ID
            JOIN personal_information pi ON pi.personal_information_ID = cl.personal_information_ID
            WHERE b.booking_ID = :bookingId
            """)
    Optional<BookingDTO> findBookingById(Integer bookingId);

    List<Booking> findByClientId(Integer clientId);
    boolean existsByFlightId(Integer flightId);

    @Query("SELECT LAST_INSERT_ID()")
    Integer selectLastId();

    @Override
    void deleteById(Integer bookingId);
}
