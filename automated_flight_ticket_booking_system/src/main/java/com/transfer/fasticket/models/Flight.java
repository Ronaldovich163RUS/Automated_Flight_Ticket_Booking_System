package com.transfer.fasticket.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.sql.Date;
import java.sql.Time;
import java.time.Duration;

@Data
@Table("flight")
public class Flight {
    @Id
    private Integer flightId;
    private Integer departureCityId;
    private Integer destinationCityId;
    private Date departureDate;
    private Time departureTime;
    private Integer airplaneId;
    private Time flightDuration;
    private String flightNumber;
}
