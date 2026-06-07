package com.huit.restaurantbackend.service;

import com.huit.restaurantbackend.dto.CartItemRequest;
import com.huit.restaurantbackend.entity.CartItem;
import com.huit.restaurantbackend.entity.Food;
import com.huit.restaurantbackend.entity.User;
import com.huit.restaurantbackend.exception.BadRequestException;
import com.huit.restaurantbackend.exception.ResourceNotFoundException;
import com.huit.restaurantbackend.repository.CartItemRepository;
import com.huit.restaurantbackend.repository.FoodRepository;
import com.huit.restaurantbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartItemService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CartItem> getCartByUser(Long userId) {
        return cartItemRepository.findByUserId(userId);
    }

    public CartItem addToCart(Long userId, CartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user"));
        Food food = foodRepository.findById(request.getFoodId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay mon an"));

        if (request.getQuantity() <= 0) {
            throw new BadRequestException("So luong phai lon hon 0");
        }

        // Check if food already in cart -> merge quantity
        Optional<CartItem> existing = cartItemRepository.findByUserIdAndFoodId(userId, request.getFoodId());
        if (existing.isPresent()) {
            CartItem cartItem = existing.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            return cartItemRepository.save(cartItem);
        }

        CartItem cartItem = new CartItem();
        cartItem.setUser(user);
        cartItem.setFood(food);
        cartItem.setQuantity(request.getQuantity());
        return cartItemRepository.save(cartItem);
    }

    public CartItem updateQuantity(Long cartItemId, int quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay cart item"));
        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }
        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

    public void removeFromCart(Long id) {
        cartItemRepository.deleteById(id);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}