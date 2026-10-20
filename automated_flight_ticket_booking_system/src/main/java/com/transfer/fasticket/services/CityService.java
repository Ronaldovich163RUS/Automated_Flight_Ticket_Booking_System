package com.transfer.fasticket.services;

import com.transfer.fasticket.models.City;
import com.transfer.fasticket.repositories.CityRepository;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@NoArgsConstructor
public class CityService {
    @Autowired
    private CityRepository cityRepository;

    /*
    public Iterable<City> getAllCities(){
        return cityRepository.findAll();
    }

    public List<String> getAllNames(){
        List<String> names = new ArrayList<>(15);
        Iterable<City> cities = getAllCities();
        for (City city: cities){
            names.add(city.getName());
        }
        return names;
    }
     */

    public Iterable<String> getAllNames(){
        return cityRepository.findAllNames();
    }

    public Iterable<String> getAllNamesExceptSamara(){
        return cityRepository.findAllNamesExceptSamara();
    }

    public Iterable<City> getAll(){
        return cityRepository.findAll();
    }


}
