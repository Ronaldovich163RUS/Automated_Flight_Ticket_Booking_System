package com.transfer.fasticket.repositories;

import com.transfer.fasticket.models.SeatStructure;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeatStructureRepository extends CrudRepository<SeatStructure, Integer> {
    @Query("SELECT * FROM seat_structure WHERE cabin_structure_id = :cabinStructureId")
    List<SeatStructure> findByCabinStructureId(@Param("cabinStructureId") Integer cabinStructureId);
}
