package com.transfer.fasticket.repositories;

import com.transfer.fasticket.dto.SeatDTO;
import com.transfer.fasticket.models.City;
import com.transfer.fasticket.models.Seat;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeatRepository extends CrudRepository<Seat, Integer> {
    @Query("""
              SELECT `row`, seat, price, taken FROM seat
              JOIN seat_structure ON seat.seat_structure_ID = seat_structure.seat_structure_ID
              WHERE flight_ID = :flightId
              """)
    Iterable<SeatDTO> findAllByFlightId(Integer flightId);

    @Query("SELECT * FROM seat WHERE flight_id = :flightId")
    List<Seat> findByFlightId(@Param("flightId") Integer flightId);

    @Query("SELECT * FROM seat WHERE flight_id = :flightId AND taken = false")
    List<Seat> findAvailableSeatsByFlightId(@Param("flightId") Integer flightId);

    @Query("SELECT * FROM seat s " +
            "JOIN seat_structure ss ON s.seat_structure_id = ss.seat_structure_id " +
            "JOIN cabin_structure cs ON ss.cabin_structure_id = cs.cabin_structure_id " +
            "WHERE s.flight_id = :flightId " +
            "AND cs.service_class_id = :serviceClassId")
    List<Seat> findByFlightIdAndServiceClass(
            @Param("flightId") Integer flightId,
            @Param("serviceClassId") Integer serviceClassId);

    @Query("""
            SELECT `row`, seat, taken FROM seat AS s
            JOIN seat_structure AS ss ON s.seat_structure_ID = ss.seat_structure_ID
            WHERE flight_ID = :flightId AND cabin_structure_ID = :cabinStructureId
            """)
    List<SeatDTO> findByFlightIdAndCabinStructureId(Integer flightId, Integer cabinStructureId);

    @Query("""
            SELECT max(price) FROM seat AS s
            JOIN seat_structure AS ss ON s.seat_structure_ID = ss.seat_structure_ID
            WHERE flight_ID = :flightId AND cabin_structure_ID = :cabinStructureId
            """)
    Double getPriceForServiceClass(Integer flightId, Integer cabinStructureId);

    @Query("""
        SELECT s.seat_id, s.flight_id, s.seat_structure_id, s.price, s.taken FROM seat s
        JOIN seat_structure ss ON s.seat_structure_id = ss.seat_structure_id
        WHERE s.flight_id = :flightId AND ss.row = :row AND ss.seat = :seat
    """)
    Seat findByFlightIdAndRowAndSeat(@Param("flightId") Integer flightId, @Param("row") Integer row, @Param("seat") String seat);

}
