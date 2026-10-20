package com.transfer.fasticket.repositories;

import com.transfer.fasticket.models.City;
import com.transfer.fasticket.models.Ticket;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends CrudRepository<Ticket, Integer> {
    @Query("SELECT * FROM ticket WHERE booking_id = :bookingId")
    List<Ticket> findByBookingId(@Param("bookingId") Integer bookingId);

    @Query("SELECT * FROM ticket WHERE personal_information_id = :personalInformationId")
    List<Ticket> findByPersonalInformationId(@Param("personalInformationId") Integer personalInformationId);
}
