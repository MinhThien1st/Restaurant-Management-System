package com.huit.restaurantbackend.service;

import com.huit.restaurantbackend.dto.ReservationRequest;
import com.huit.restaurantbackend.entity.Reservation;
import com.huit.restaurantbackend.entity.User;
import com.huit.restaurantbackend.exception.BadRequestException;
import com.huit.restaurantbackend.exception.ResourceNotFoundException;
import com.huit.restaurantbackend.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    public Reservation createReservation(ReservationRequest request, User user) {
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            throw new BadRequestException("Ten khach hang khong duoc de trong");
        }
        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new BadRequestException("So dien thoai khong duoc de trong");
        }
        if (request.getReserveDate() == null) {
            throw new BadRequestException("Ngay dat ban khong duoc de trong");
        }
        if (request.getReserveTime() == null || request.getReserveTime().trim().isEmpty()) {
            throw new BadRequestException("Gio dat ban khong duoc de trong");
        }
        if (request.getNumGuests() <= 0) {
            throw new BadRequestException("So luong khach phai lon hon 0");
        }

        Reservation reservation = new Reservation();
        reservation.setCustomerName(request.getCustomerName());
        reservation.setPhone(request.getPhone());
        reservation.setEmail(request.getEmail());
        reservation.setReserveDate(request.getReserveDate());
        reservation.setReserveTime(request.getReserveTime());
        reservation.setNumGuests(request.getNumGuests());
        reservation.setNote(request.getNote());
        reservation.setUser(user);
        reservation.setStatus("PENDING");

        return reservationRepository.save(reservation);
    }

    public List<Reservation> getAll() {
        return reservationRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Reservation> getByUser(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    public Reservation updateStatus(Long id, String status) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay lich dat ban voi id = " + id));

        if (!"PENDING".equals(status) && !"CONFIRMED".equals(status) && !"CANCELLED".equals(status)) {
            throw new BadRequestException("Trang thai khong hop le");
        }

        reservation.setStatus(status);
        return reservationRepository.save(reservation);
    }

    public void delete(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay lich dat ban voi id = " + id));
        reservationRepository.delete(reservation);
    }
}
