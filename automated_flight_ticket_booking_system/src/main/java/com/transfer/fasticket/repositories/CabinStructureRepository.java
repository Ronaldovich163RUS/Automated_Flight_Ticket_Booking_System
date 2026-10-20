package com.transfer.fasticket.repositories;

import com.transfer.fasticket.dto.CabinStructureDTO;
import com.transfer.fasticket.models.CabinStructure;
import com.transfer.fasticket.models.City;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CabinStructureRepository extends CrudRepository<CabinStructure, Integer> {
    List<CabinStructure> findByAirplaneId(Integer airplaneId);

    @Modifying
    @Query("DELETE FROM cabin_structure WHERE airplane_ID = :airplaneId")
    void deleteByAirplaneId(Integer airplaneId);

    @Query("""
            SELECT cabin_structure_ID, sc.name as service_class, number_of_rows, number_of_seats_per_row
            FROM cabin_structure AS cs
            JOIN service_class AS sc ON cs.service_class_ID = sc.service_class_ID
            WHERE airplane_ID = :airplaneId
            """)
    List<CabinStructureDTO> findByAirplaneIdWithClasses(@Param("airplaneId") Integer airplaneId);
}