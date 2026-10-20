package com.transfer.fasticket.services;

import com.transfer.fasticket.dto.AdminSeatDTO;
import com.transfer.fasticket.models.CabinStructure;
import com.transfer.fasticket.models.Seat;
import com.transfer.fasticket.models.SeatStructure;
import com.transfer.fasticket.models.ServiceClass;
import com.transfer.fasticket.repositories.CabinStructureRepository;
import com.transfer.fasticket.repositories.SeatRepository;
import com.transfer.fasticket.repositories.SeatStructureRepository;
import com.transfer.fasticket.repositories.ServiceClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SeatService {
        private final SeatRepository seatRepository;
        private final SeatStructureRepository seatStructureRepository;
        private final CabinStructureRepository cabinStructureRepository;
        private final ServiceClassRepository serviceClassRepository;

        @Autowired
        public SeatService(SeatRepository seatRepository,
                        SeatStructureRepository seatStructureRepository,
                        CabinStructureRepository cabinStructureRepository,
                        ServiceClassRepository serviceClassRepository) {
                this.seatRepository = seatRepository;
                this.seatStructureRepository = seatStructureRepository;
                this.cabinStructureRepository = cabinStructureRepository;
                this.serviceClassRepository = serviceClassRepository;
        }

        @Transactional(readOnly = true)
        public List<AdminSeatDTO> getAvailableSeatsForFlight(Integer flightId) {
                List<Seat> availableSeats = seatRepository.findAvailableSeatsByFlightId(flightId);
                return availableSeats.stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<AdminSeatDTO> getSeatsForFlightAndServiceClass(Integer flightId, Integer serviceClassId) {
                List<Seat> seats = seatRepository.findByFlightIdAndServiceClass(flightId, serviceClassId);
                return seats.stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        @Transactional
        public void markSeatAsTaken(Integer seatId) {
                Seat seat = seatRepository.findById(seatId)
                                .orElseThrow(() -> new RuntimeException("Seat not found: " + seatId));
                seat.setTaken(true);
                seatRepository.save(seat);
        }

        @Transactional
        public void markSeatAsAvailable(Integer seatId) {
                Seat seat = seatRepository.findById(seatId)
                                .orElseThrow(() -> new RuntimeException("Seat not found: " + seatId));
                seat.setTaken(false);
                seatRepository.save(seat);
        }

        private AdminSeatDTO convertToDTO(Seat seat) {
                AdminSeatDTO dto = new AdminSeatDTO();
                dto.setSeatId(seat.getSeatId());
                dto.setFlightId(seat.getFlightId());
                dto.setSeatStructureId(seat.getSeatStructureId());
                dto.setPrice(seat.getPrice());
                dto.setTaken(seat.getTaken());

                // Get additional information
                SeatStructure seatStructure = seatStructureRepository.findById(seat.getSeatStructureId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Seat structure not found: " + seat.getSeatStructureId()));

                CabinStructure cabinStructure = cabinStructureRepository.findById(seatStructure.getCabinStructureId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Cabin structure not found: " + seatStructure.getCabinStructureId()));

                ServiceClass serviceClass = serviceClassRepository.findById(cabinStructure.getServiceClassId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Service class not found: " + cabinStructure.getServiceClassId()));

                dto.setServiceClassName(serviceClass.getName());
                dto.setRow(seatStructure.getRow());
                dto.setSeat(seatStructure.getSeat() != null ? seatStructure.getSeat().charAt(0) : null);

                return dto;
        }
}