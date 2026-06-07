package com.huit.restaurantbackend.controller;

import com.huit.restaurantbackend.dto.ReservationRequest;
import com.huit.restaurantbackend.entity.Reservation;
import com.huit.restaurantbackend.entity.User;
import com.huit.restaurantbackend.exception.BadRequestException;
import com.huit.restaurantbackend.repository.UserRepository;
import com.huit.restaurantbackend.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private UserRepository userRepository;

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found or not authenticated"));
    }

    private void checkAdmin() {
        User user = getLoggedInUser();
        if (!"ADMIN".equals(user.getRole())) {
            throw new BadRequestException("Yeu cau quyen ADMIN");
        }
    }

    @PostMapping
    public ResponseEntity<Reservation> createReservation(@RequestBody ReservationRequest request) {
        User user = null;
        try {
            user = getLoggedInUser();
        } catch (Exception e) {
            throw new BadRequestException("Ban can dang nhap de dat ban");
        }
        return ResponseEntity.ok(reservationService.createReservation(request, user));
    }

    @GetMapping
    public ResponseEntity<List<Reservation>> getAll() {
        checkAdmin();
        return ResponseEntity.ok(reservationService.getAll());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Reservation>> getMyReservations() {
        User user = getLoggedInUser();
        return ResponseEntity.ok(reservationService.getByUser(user.getId()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Reservation> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        checkAdmin();
        return ResponseEntity.ok(reservationService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        checkAdmin();
        reservationService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Da xoa lich dat ban thanh cong"));
    }
}
