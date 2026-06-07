package com.huit.restaurantbackend.repository;

import com.huit.restaurantbackend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.food.id, oi.food.name, SUM(oi.quantity) as totalQty FROM OrderItem oi WHERE oi.order.status = 'COMPLETED' GROUP BY oi.food.id, oi.food.name ORDER BY totalQty DESC")
    List<Object[]> findTopSellingFoods();
}
