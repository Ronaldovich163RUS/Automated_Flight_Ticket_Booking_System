package com.transfer.fasticket.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Data
public class FilterDTO {
    //@NotBlank(message = "Укажите город прибытия")
    private String destinationCity; // Привязка к <input id="to">

    //@NotNull(message = "Выберите тип поездки")
    private Boolean tripType = true; // true = ONE_WAY, false = ROUND_TRIP

    //@FutureOrPresent(message = "Некорректная дата вылета")
    private Date departureDate;

    //@FutureOrPresent(message = "Некорректная дата возврата")
    private Date returnDate; // Только для ROUND_TRIP

    
    @Min(value = 1, message = "Минимум 1 взрослый")
    @Max(value = 3, message = "Максимум 3 взрослых")
    private Integer adults = 1;

    @Min(value = 0, message = "Минимум 0 детей")
    @Max(value = 3, message = "Максимум 3 ребёнка")
    private Integer children = 0;

    @Min(value = 0, message = "Минимум 0 младенцев")
    @Max(value = 1, message = "Максимум 1 младенец")
    private Integer infants = 0;
}
