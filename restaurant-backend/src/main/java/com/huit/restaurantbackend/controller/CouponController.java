package com.huit.restaurantbackend.controller;

import com.huit.restaurantbackend.entity.Coupon;
import com.huit.restaurantbackend.entity.User;
import com.huit.restaurantbackend.exception.BadRequestException;
import com.huit.restaurantbackend.repository.UserRepository;
import com.huit.restaurantbackend.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

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
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        checkAdmin();
        return ResponseEntity.ok(couponService.createCoupon(coupon));
    }

    @GetMapping
    public ResponseEntity<List<Coupon>> getAll() {
        checkAdmin();
        return ResponseEntity.ok(couponService.getAll());
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCoupon(
            @RequestParam String code,
            @RequestParam double amount) {
        getLoggedInUser();
        Coupon coupon = couponService.validateCoupon(code, amount);
        double discount = couponService.calculateDiscount(coupon, amount);
        return ResponseEntity.ok(Map.of(
                "valid", true,
                "code", coupon.getCode(),
                "discountPercent", coupon.getDiscountPercent(),
                "discountAmount", discount
        ));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Coupon> toggleActive(@PathVariable Long id) {
        checkAdmin();
        return ResponseEntity.ok(couponService.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        checkAdmin();
        couponService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Da xoa ma giam gia thanh cong"));
    }
}
