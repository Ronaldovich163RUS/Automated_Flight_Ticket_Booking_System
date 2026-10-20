package com.transfer.fasticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.relational.core.mapping.Column;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FlightDTO {
    @Column("flight_ID")
    private Integer flightID;
    @Column("flight_number")
    private String flightNumber;
    @Column("departure_date")
    private LocalDate departureDate;
    @Column("departure_time")
    private LocalTime departureTime;
    @Column("departure_date")
    private LocalDate arrivalDate;
    @Column("departure_time")
    private LocalTime arrivalTime;
    @Column("flight_duration")
    private LocalTime flightDuration;
    @Column("departure_city")
    private String departureCity;
    @Column("destination_city")
    private String destinationCity;
    @Column("min_price")
    private Double minPrice;
    @Column("airline_name")
    private String airlineName;

    public void setArrivalDateTime() {
        LocalDateTime dateTime = LocalDateTime.of(departureDate, departureTime)
                .plusHours(flightDuration.getHour())
                .plusMinutes(flightDuration.getMinute());
        this.arrivalDate = dateTime.toLocalDate();
        this.arrivalTime = dateTime.toLocalTime();
    }
}
