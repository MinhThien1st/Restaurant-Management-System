package com.huit.restaurantbackend.repository;

import com.huit.restaurantbackend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    List<Reservation> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
