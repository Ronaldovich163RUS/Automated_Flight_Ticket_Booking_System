package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.FilterDTO;
import com.transfer.fasticket.dto.FlightDTO;
import com.transfer.fasticket.models.Flight;
import com.transfer.fasticket.repositories.CityRepository;
import com.transfer.fasticket.repositories.CustomRepository;
import com.transfer.fasticket.repositories.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class ResultsService {
    @Autowired
    FlightRepository flightRepository;
    @Autowired
    CityRepository cityRepository;
    @Autowired
    CustomRepository customRepository;
    FilterDTO currentFilter;
    public List<FlightDTO> getFlightsOneWay(String destCity, Date depDate) {
        return customRepository.findAllAvailableFlights(destCity, depDate);
    }

    public List<FlightDTO> getFlightsReturn(String depCity, Date depDate) {
        return customRepository.findAllAvailableFlightsReturn(depCity, depDate);
    }


    public void saveSearchResults(FilterDTO filter) {
        currentFilter = filter;
    }

    public FilterDTO getSearchFilter(String searchId) {
        return currentFilter;
    }


}
