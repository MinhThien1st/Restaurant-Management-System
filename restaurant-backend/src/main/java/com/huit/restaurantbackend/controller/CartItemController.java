package com.huit.restaurantbackend.controller;

import com.huit.restaurantbackend.dto.CartItemRequest;
import com.huit.restaurantbackend.entity.CartItem;
import com.huit.restaurantbackend.repository.UserRepository;
import com.huit.restaurantbackend.service.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartItemController {

    @Autowired
    private CartItemService cartItemService;

    @Autowired
    private UserRepository userRepository;

    private Long getLoggedInUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email))
                .getId();
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart() {
        return ResponseEntity.ok(cartItemService.getCartByUser(getLoggedInUserId()));
    }

    @PostMapping
    public ResponseEntity<CartItem> addToCart(@RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartItemService.addToCart(getLoggedInUserId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItem> updateQuantity(@PathVariable Long id, @RequestParam int quantity) {
        return ResponseEntity.ok(cartItemService.updateQuantity(id, quantity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> removeFromCart(@PathVariable Long id) {
        cartItemService.removeFromCart(id);
        return ResponseEntity.ok(Map.of("message", "Da xoa mon khoi gio hang"));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearCart() {
        cartItemService.clearCart(getLoggedInUserId());
        return ResponseEntity.ok(Map.of("message", "Da xoa toan bo gio hang"));
    }
}