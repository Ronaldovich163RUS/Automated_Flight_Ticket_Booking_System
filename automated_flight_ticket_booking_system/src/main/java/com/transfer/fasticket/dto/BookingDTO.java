package com.transfer.fasticket.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Data
public class BookingDTO {
    private Integer bookingId;
    private LocalDate departureDate;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private String flightNumber;
    private String departureCity;
    private String destinationCity;
    private LocalTime duration;
    private String luggage;
    private Double price;
    private String firstName;
    private String lastName;
    private String middleName;
    private String airlineName;
    private Double baggagePrice;
    private String passengerType = "Взрослый / Adult"; // Default value
    private Integer handLuggage = 1; // Default value for hand luggage

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy");

    // Вспомогательные методы для фронтенда
    public String getPassengerName() {
        if (middleName != null && !middleName.isEmpty()) {
            return lastName + " " + firstName + " " + middleName;
        }
        return lastName + " " + firstName;
    }

    public String getFormattedDuration() {
        if (duration != null) {
            int hours = duration.getHour();
            int minutes = duration.getMinute();
            return hours + " ч " + minutes + " мин";
        }
        return "";
    }

    public String getFormattedDepartureTime() {
        return departureTime != null ? departureTime.format(TIME_FORMATTER) : "";
    }

    public String getFormattedArrivalTime() {
        return arrivalTime != null ? arrivalTime.format(TIME_FORMATTER) : "";
    }

    public String getFormattedDepartureDate() {
        return departureDate != null ? departureDate.format(DATE_FORMATTER) : "";
    }
} 