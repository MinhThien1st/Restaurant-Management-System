package com.huit.restaurantbackend.controller;

import com.huit.restaurantbackend.dto.ChangePasswordRequest;
import com.huit.restaurantbackend.entity.User;
import com.huit.restaurantbackend.exception.BadRequestException;
import com.huit.restaurantbackend.repository.UserRepository;
import com.huit.restaurantbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    private void checkAdmin() {
        User user = getLoggedInUser();
        if (!"ADMIN".equals(user.getRole())) {
            throw new BadRequestException("Yeu cau quyen ADMIN");
        }
    }

    private void checkAdminOrSelf(Long targetUserId) {
        User user = getLoggedInUser();
        if (!"ADMIN".equals(user.getRole()) && !user.getId().equals(targetUserId)) {
            throw new BadRequestException("Ban khong co quyen thuc hien hanh dong nay");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe() {
        return ResponseEntity.ok(getLoggedInUser());
    }

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        checkAdmin();
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        checkAdminOrSelf(id);
        return ResponseEntity.ok(userService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody User user) {
        checkAdminOrSelf(id);
        // Standard users cannot upgrade their own role to ADMIN
        User loggedIn = getLoggedInUser();
        if (!"ADMIN".equals(loggedIn.getRole())) {
            user.setRole(null); // Ignored role update
        }
        return ResponseEntity.ok(userService.update(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        checkAdmin();
        User loggedIn = getLoggedInUser();
        if (loggedIn.getId().equals(id)) {
            throw new BadRequestException("Khong the tu xoa tai khoan cua chinh minh");
        }
        userService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Da xoa user thanh cong"));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {
        // Only self can change their password
        User loggedIn = getLoggedInUser();
        if (!loggedIn.getId().equals(id)) {
            throw new BadRequestException("Ban chi co the doi mat khau cua chinh minh");
        }
        userService.changePassword(id, request);
        return ResponseEntity.ok(Map.of("message", "Da doi mat khau thanh cong"));
    }
}
