package com.huit.restaurantbackend.service;

import com.huit.restaurantbackend.dto.OrderItemRequest;
import com.huit.restaurantbackend.dto.OrderRequest;
import com.huit.restaurantbackend.entity.*;
import com.huit.restaurantbackend.exception.BadRequestException;
import com.huit.restaurantbackend.exception.ResourceNotFoundException;
import com.huit.restaurantbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CouponService couponService;

    @Transactional
    public Order placeOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Don hang phai co it nhat 1 mon");
        }

        Order order = new Order();
        order.setUser(user);
        order.setCustomerName(request.getCustomerName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setStatus("PENDING");

        List<OrderItem> orderItems = new ArrayList<>();
        double totalPrice = 0;

        for (OrderItemRequest itemReq : request.getItems()) {
            Food food = foodRepository.findById(itemReq.getFoodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay mon an voi id = " + itemReq.getFoodId()));

            if (itemReq.getQuantity() <= 0) {
                throw new BadRequestException("So luong phai lon hon 0");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setFood(food);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setOrder(order);
            orderItems.add(orderItem);

            totalPrice += food.getPrice() * itemReq.getQuantity();
        }

        double discountAmount = 0.0;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Coupon coupon = couponService.validateCoupon(request.getCouponCode(), totalPrice);
            discountAmount = couponService.calculateDiscount(coupon, totalPrice);
            order.setCouponCode(coupon.getCode());
            order.setDiscountAmount(discountAmount);
            couponService.incrementUsedCount(coupon.getCode());
        }

        order.setTotalPrice(Math.max(0.0, totalPrice - discountAmount));
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Clear cart after placing order
        cartItemRepository.deleteByUserId(userId);

        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay don hang voi id = " + id));
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order updateStatus(Long orderId, String newStatus) {
        Order order = getOrderById(orderId);
        String currentStatus = order.getStatus();

        // Validate status transition
        boolean valid = false;
        if ("PENDING".equals(currentStatus) && ("CONFIRMED".equals(newStatus) || "CANCELLED".equals(newStatus))) {
            valid = true;
        } else if ("CONFIRMED".equals(currentStatus) && ("COMPLETED".equals(newStatus) || "CANCELLED".equals(newStatus))) {
            valid = true;
        }

        if (!valid) {
            throw new BadRequestException("Khong the chuyen trang thai tu " + currentStatus + " sang " + newStatus);
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        Order order = getOrderById(id);
        if (!("CANCELLED".equals(order.getStatus()) || "COMPLETED".equals(order.getStatus()))) {
            throw new BadRequestException("Chi co the xoa don da huy hoac da hoan thanh");
        }
        orderRepository.delete(order);
    }

    public Order cancelOrderByUser(Long orderId, Long userId) {
        Order order = getOrderById(orderId);
        if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Ban khong co quyen huy don hang nay");
        }
        if (!"PENDING".equals(order.getStatus())) {
            throw new BadRequestException("Chi co the huy don hang o trang thai PENDING");
        }
        order.setStatus("CANCELLED");
        return orderRepository.save(order);
    }
}