package com.huit.restaurantbackend.repository;

import com.huit.restaurantbackend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByStatus(String status);
    List<Order> findAllByOrderByOrderDateDesc();
    long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(o.totalPrice), 0.0) FROM Order o WHERE o.status = 'COMPLETED'")
    Double getTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalPrice), 0.0) FROM Order o WHERE o.status = 'COMPLETED' AND o.orderDate BETWEEN :fromDate AND :toDate")
    Double getRevenueBetween(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    @Query("SELECT CAST(o.orderDate AS LocalDate), COALESCE(SUM(o.totalPrice), 0.0) FROM Order o WHERE o.status = 'COMPLETED' AND o.orderDate >= :startDate GROUP BY CAST(o.orderDate AS LocalDate) ORDER BY CAST(o.orderDate AS LocalDate) ASC")
    List<Object[]> getRevenueByDay(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT CAST(o.orderDate AS LocalDate), COUNT(o.id) FROM Order o WHERE o.orderDate >= :startDate GROUP BY CAST(o.orderDate AS LocalDate) ORDER BY CAST(o.orderDate AS LocalDate) ASC")
    List<Object[]> getOrdersByDay(@Param("startDate") LocalDateTime startDate);
}