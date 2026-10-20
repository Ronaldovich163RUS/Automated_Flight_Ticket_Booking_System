package com.transfer.fasticket.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@NoArgsConstructor
@Table("ticket")
public class Ticket {
    @Id
    private Integer ticketId;
    private Integer personalInformationId;
    private Integer bookingId;
    private Integer seatId;

    public Ticket(Integer personalInformationId,
            Integer bookingId,
            Integer seatId){
        this.personalInformationId = personalInformationId;
        this.bookingId = bookingId;
        this.seatId = seatId;
    }
}
