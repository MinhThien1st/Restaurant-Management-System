package com.huit.restaurantbackend.controller;

import com.huit.restaurantbackend.dto.ReviewRequest;
import com.huit.restaurantbackend.entity.Review;
import com.huit.restaurantbackend.entity.User;
import com.huit.restaurantbackend.exception.BadRequestException;
import com.huit.restaurantbackend.repository.UserRepository;
import com.huit.restaurantbackend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found or not authenticated"));
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.createReview(request, getLoggedInUser()));
    }

    @GetMapping
    public ResponseEntity<List<Review>> getAll() {
        return ResponseEntity.ok(reviewService.getAll());
    }

    @GetMapping("/food/{foodId}")
    public ResponseEntity<List<Review>> getByFoodId(@PathVariable Long foodId) {
        return ResponseEntity.ok(reviewService.getByFoodId(foodId));
    }

    @GetMapping("/food/{foodId}/average")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable Long foodId) {
        double avg = reviewService.getAverageRating(foodId);
        return ResponseEntity.ok(Map.of("averageRating", avg));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        reviewService.deleteReview(id, getLoggedInUser());
        return ResponseEntity.ok(Map.of("message", "Da xoa danh gia thanh cong"));
    }
}
