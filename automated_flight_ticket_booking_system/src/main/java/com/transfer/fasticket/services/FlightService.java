package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.AdminFlightDTO;
import com.transfer.fasticket.dto.FlightResponseDTO;
import com.transfer.fasticket.models.*;
import com.transfer.fasticket.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlightService {
    private final FlightRepository flightRepository;
    private final CityRepository cityRepository;
    private final AirplaneRepository airplaneRepository;
    private final SeatRepository seatRepository;
    private final BrandRepository brandRepository;
    private final AirlineRepository airlineRepository;
    private final BookingRepository bookingRepository;

    @Autowired
    public FlightService(FlightRepository flightRepository,
                         CityRepository cityRepository,
                         AirplaneRepository airplaneRepository,
                         SeatRepository seatRepository,
                         BrandRepository brandRepository,
                         AirlineRepository airlineRepository,
                         BookingRepository bookingRepository) {
        this.flightRepository = flightRepository;
        this.cityRepository = cityRepository;
        this.airplaneRepository = airplaneRepository;
        this.seatRepository = seatRepository;
        this.brandRepository = brandRepository;
        this.airlineRepository = airlineRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public FlightResponseDTO addFlight(AdminFlightDTO flightDTO) {
        Flight flight = new Flight();
        flight.setFlightId(flightDTO.getFlightId());
        flight.setFlightNumber(flightDTO.getFlightNumber());

        // Get city IDs
        City departureCity = cityRepository.findByName(flightDTO.getDepartureCity())
                .orElseThrow(() -> new RuntimeException("Departure city not found: " + flightDTO.getDepartureCity()));
        City destinationCity = cityRepository.findByName(flightDTO.getDestinationCity())
                .orElseThrow(
                        () -> new RuntimeException("Destination city not found: " + flightDTO.getDestinationCity()));

        flight.setDepartureCityId(departureCity.getCityId());
        flight.setDestinationCityId(destinationCity.getCityId());

        // Get airplane by ID
        Airplane airplane = airplaneRepository.findById(flightDTO.getAirplaneId())
                .orElseThrow(() -> new RuntimeException("Airplane not found with ID: " + flightDTO.getAirplaneId()));
        flight.setAirplaneId(airplane.getAirplaneId());

        // Set dates and times
        flight.setDepartureDate(Date.valueOf(flightDTO.getDepartureDate()));
        flight.setDepartureTime(Time.valueOf(flightDTO.getDepartureTime()));

        // Преобразуем время полета в Time
        LocalTime flightDuration = flightDTO.getFlightDuration();
        if (flightDuration.equals(LocalTime.MIDNIGHT)) {
            throw new RuntimeException("Длительность полета должна быть больше нуля");
        }
        flight.setFlightDuration(Time.valueOf(flightDuration));

        Flight savedFlight = flightRepository.save(flight);
        return convertToResponseDTO(savedFlight);
    }

    @Transactional
    public FlightResponseDTO updateFlight(AdminFlightDTO flightDTO) {
        Flight flight = flightRepository.findById(flightDTO.getFlightId())
                .orElseThrow(() -> new RuntimeException("Рейс не найден"));
        flight.setFlightNumber(flightDTO.getFlightNumber());
        City departureCity = cityRepository.findByName(flightDTO.getDepartureCity())
                .orElseThrow(() -> new RuntimeException("Departure city not found: " + flightDTO.getDepartureCity()));
        City destinationCity = cityRepository.findByName(flightDTO.getDestinationCity())
                .orElseThrow(
                        () -> new RuntimeException("Destination city not found: " + flightDTO.getDestinationCity()));
        flight.setDepartureCityId(departureCity.getCityId());
        flight.setDestinationCityId(destinationCity.getCityId());

        // Get airplane by ID and validate it belongs to the selected brand and airline
        Airplane airplane = airplaneRepository.findById(flightDTO.getAirplaneId())
                .orElseThrow(() -> new RuntimeException("Airplane not found with ID: " + flightDTO.getAirplaneId()));

        // Validate that the airplane belongs to the selected brand
        if (!airplane.getBrandId().equals(flightDTO.getBrandId())) {
            throw new RuntimeException("Selected airplane does not belong to the selected brand");
        }

        // Validate that the brand belongs to the selected airline
        Brand brand = brandRepository.findById(flightDTO.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found with ID: " + flightDTO.getBrandId()));
        if (!brand.getAirlineId().equals(flightDTO.getAirlineId())) {
            throw new RuntimeException("Selected brand does not belong to the selected airline");
        }

        flight.setAirplaneId(airplane.getAirplaneId());
        flight.setDepartureDate(Date.valueOf(flightDTO.getDepartureDate()));
        flight.setDepartureTime(Time.valueOf(flightDTO.getDepartureTime()));
        LocalTime flightDuration = flightDTO.getFlightDuration();
        if (flightDuration.equals(LocalTime.MIDNIGHT)) {
            throw new RuntimeException("Длительность полета должна быть больше нуля");
        }
        flight.setFlightDuration(Time.valueOf(flightDuration));
        Flight savedFlight = flightRepository.save(flight);
        return convertToResponseDTO(savedFlight);
    }

    @Transactional(readOnly = true)
    public List<FlightResponseDTO> getAllFlights() {
        List<Flight> flights = (List<Flight>) flightRepository.findAll();
        return flights.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FlightResponseDTO> searchFlights(String departureCity, String destinationCity, String departureDate) {
        LocalDate date = departureDate != null ? LocalDate.parse(departureDate) : null;
        List<Flight> flights = flightRepository.findByDepartureCityAndDestinationCityAndDepartureDate(
                departureCity, destinationCity, date != null ? Date.valueOf(date) : null);
        return flights.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean hasBookings(Integer flightId) {
        return bookingRepository.existsByFlightId(flightId);
    }

    @Transactional
    public void deleteFlight(Integer flightId) {
        // Проверяем наличие броней
        if (hasBookings(flightId)) {
            throw new RuntimeException("Невозможно удалить рейс, так как на него есть бронирования");
        }

        // Delete associated seats first
        List<Seat> seats = seatRepository.findByFlightId(flightId);
        seats.forEach(seat -> seatRepository.deleteById(seat.getSeatId()));

        // Then delete the flight
        flightRepository.deleteById(flightId);
    }

    @Transactional(readOnly = true)
    public FlightResponseDTO getFlightById(Integer id) {
        return flightRepository.findById(id).map(this::convertToResponseDTO).orElse(null);
    }

    private FlightResponseDTO convertToResponseDTO(Flight flight) {
        FlightResponseDTO dto = new FlightResponseDTO();
        dto.setFlightId(flight.getFlightId());
        dto.setFlightNumber(flight.getFlightNumber());

        // Получаем города
        City departureCity = cityRepository.findById(flight.getDepartureCityId()).orElseThrow();
        City destinationCity = cityRepository.findById(flight.getDestinationCityId()).orElseThrow();
        dto.setDepartureCity(departureCity.getName());
        dto.setDestinationCity(destinationCity.getName());

        // Получаем информацию о самолете, бренде и авиакомпании
        Airplane airplane = airplaneRepository.findById(flight.getAirplaneId()).orElseThrow();
        dto.setAirplaneModel(String.valueOf(airplane.getModel()));
        dto.setAirplaneId(airplane.getAirplaneId());

        Brand brand = brandRepository.findById(airplane.getBrandId()).orElseThrow();
        dto.setBrandName(brand.getName());

        Airline airline = airlineRepository.findById(brand.getAirlineId()).orElseThrow();
        dto.setAirlineName(airline.getName());

        // Устанавливаем даты и время
        dto.setDepartureDate(flight.getDepartureDate().toLocalDate());
        dto.setDepartureTime(flight.getDepartureTime().toLocalTime());
        dto.setFlightDuration(flight.getFlightDuration().toLocalTime());

        // Подсчитываем доступные места
        List<Seat> availableSeats = seatRepository.findAvailableSeatsByFlightId(flight.getFlightId());
        dto.setAvailableSeats(availableSeats.size());

        return dto;
    }
}