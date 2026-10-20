package com.transfer.fasticket.repositories;

import com.transfer.fasticket.dto.FlightDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.Time;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Repository
public class CustomRepository {
    @Autowired
    JdbcTemplate jdbcTemplate;

    /*
    public List<FlightDTO> findAllAvailableFlights(){
        String sql = """
            SELECT f.flight_number as flight_number,
                   f.departure_date as departure_date,
                   f.departure_time as departure_time,
                   f.flight_duration as flight_duration,
                   dep.name as departure_city,
                   dest.name as destination_city,
                   MIN(s.price) as min_price
            FROM flight f
            JOIN city dep ON f.departure_city_ID = dep.city_ID
            JOIN city dest ON f.destination_city_ID = dest.city_ID
            LEFT JOIN seat s ON f.flight_number = s.flight_number AND s.taken = 0
            GROUP BY f.flight_number
            HAVING min_price IS NOT NULL
        """;
        RowMapper<FlightDTO> rowMapper = (r, i) ->{
            FlightDTO flightDTO = new FlightDTO();
            flightDTO.setFlightNumber(r.getInt("flight_number"));
            flightDTO.setDepartureDate(r.getDate("departure_date").toLocalDate());
            flightDTO.setDepartureTime(r.getTime("departure_time").toLocalTime());
            //flightDTO.setFlightDuration(r.getTime("flight_duration").toLocalTime().getMinute());
            flightDTO.setDepartureCity(r.getString("departure_city"));
            flightDTO.setDestinationCity(r.getString("destination_city"));
            flightDTO.setMinPrice(r.getDouble("min_price"));
            return flightDTO;
        };
        return jdbcTemplate.query(sql, rowMapper);
    }
     */

    public List<FlightDTO> findAllAvailableFlights(String destCity, Date depDate){
        String sql = String.format(
                """
                SELECT f.flight_ID as flight_ID,
                       f.flight_number as flight_number,
                       f.departure_date as departure_date,
                       f.departure_time as departure_time,
                       f.flight_duration as flight_duration,
                       dep.name as departure_city,
                       dest.name as destination_city,
                       MIN(s.price) as min_price,
                       a.name as airline_name
                FROM flight f
                JOIN city dep ON f.departure_city_ID = dep.city_ID
                JOIN city dest ON f.destination_city_ID = dest.city_ID
                JOIN airplane ap ON ap.airplane_ID = f.airplane_ID
                JOIN brand b ON b.brand_ID = ap.brand_ID
                JOIN airline a ON a.airline_ID = b.airline_ID
                LEFT JOIN seat s ON f.flight_ID = s.flight_ID
                WHERE dep.name = '%s' AND dest.name = '%s'
                AND departure_date = '%s'
                GROUP BY f.flight_ID
                HAVING min_price IS NOT NULL
        """, "Самара", destCity, depDate);
        RowMapper<FlightDTO> rowMapper = (r, i) ->{
            FlightDTO flightDTO = new FlightDTO();
            flightDTO.setFlightID(r.getInt("flight_ID"));
            flightDTO.setFlightNumber(r.getString("flight_number"));
            flightDTO.setDepartureDate(r.getDate("departure_date").toLocalDate());
            flightDTO.setDepartureTime(r.getTime("departure_time").toLocalTime());
            flightDTO.setFlightDuration(r.getTime("flight_duration").toLocalTime());
            flightDTO.setDepartureCity(r.getString("departure_city"));
            flightDTO.setDestinationCity(r.getString("destination_city"));
            flightDTO.setMinPrice(r.getDouble("min_price"));
            flightDTO.setAirlineName(r.getString("airline_name"));
            flightDTO.setArrivalDateTime();
            return flightDTO;
        };
        return jdbcTemplate.query(sql, rowMapper);
    }

    public List<FlightDTO> findAllAvailableFlightsReturn(String depCity, Date depDate){
        String sql = String.format(
                """
                SELECT f.flight_ID as flight_ID,
                       f.flight_number as flight_number,
                       f.departure_date as departure_date,
                       f.departure_time as departure_time,
                       f.flight_duration as flight_duration,
                       dep.name as departure_city,
                       dest.name as destination_city,
                       MIN(s.price) as min_price,
                       a.name as airline_name
                FROM flight f
                JOIN city dep ON f.departure_city_ID = dep.city_ID
                JOIN city dest ON f.destination_city_ID = dest.city_ID
                JOIN airplane ap ON ap.airplane_ID = f.airplane_ID
                JOIN brand b ON b.brand_ID = ap.brand_ID
                JOIN airline a ON a.airline_ID = b.airline_ID
                LEFT JOIN seat s ON f.flight_ID = s.flight_ID
                WHERE dep.name = \"%s\" AND dest.name = \"%s\"
                AND departure_date = \'%s\'
                GROUP BY f.flight_ID
                HAVING min_price IS NOT NULL
        """, depCity, "Самара", depDate);
        RowMapper<FlightDTO> rowMapper = (r, i) ->{
            FlightDTO flightDTO = new FlightDTO();
            flightDTO.setFlightID(r.getInt("flight_ID"));
            flightDTO.setFlightNumber(r.getString("flight_number"));
            flightDTO.setDepartureDate(r.getDate("departure_date").toLocalDate());
            flightDTO.setDepartureTime(r.getTime("departure_time").toLocalTime());
            flightDTO.setFlightDuration(r.getTime("flight_duration").toLocalTime());
            flightDTO.setDepartureCity(r.getString("departure_city"));
            flightDTO.setDestinationCity(r.getString("destination_city"));
            flightDTO.setMinPrice(r.getDouble("min_price"));
            flightDTO.setAirlineName(r.getString("airline_name"));
            flightDTO.setArrivalDateTime();
            return flightDTO;
        };
        return jdbcTemplate.query(sql, rowMapper);
    }
}
