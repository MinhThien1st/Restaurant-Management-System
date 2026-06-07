package com.huit.restaurantbackend.service;

import com.huit.restaurantbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class StatisticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public Double getTotalRevenue() {
        return orderRepository.getTotalRevenue();
    }

    public Double getRevenueBetween(LocalDateTime from, LocalDateTime to) {
        return orderRepository.getRevenueBetween(from, to);
    }

    public Map<String, Long> getOrdersSummary() {
        Map<String, Long> summary = new LinkedHashMap<>();
        summary.put("PENDING", orderRepository.countByStatus("PENDING"));
        summary.put("CONFIRMED", orderRepository.countByStatus("CONFIRMED"));
        summary.put("COMPLETED", orderRepository.countByStatus("COMPLETED"));
        summary.put("CANCELLED", orderRepository.countByStatus("CANCELLED"));
        summary.put("total", orderRepository.count());
        return summary;
    }

    public List<Map<String, Object>> getTopFoods(int limit) {
        List<Object[]> results = orderItemRepository.findTopSellingFoods();
        List<Map<String, Object>> topFoods = new ArrayList<>();
        int count = 0;
        for (Object[] row : results) {
            if (count >= limit) break;
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("foodId", row[0]);
            item.put("foodName", row[1]);
            item.put("totalQuantity", row[2]);
            topFoods.add(item);
            count++;
        }
        return topFoods;
    }

    public Map<String, Object> getDashboard() {
        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("totalUsers", userRepository.count());
        dashboard.put("totalFoods", foodRepository.count());
        dashboard.put("totalCategories", categoryRepository.count());
        dashboard.put("totalOrders", orderRepository.count());
        dashboard.put("pendingOrders", orderRepository.countByStatus("PENDING"));
        dashboard.put("totalRevenue", getTotalRevenue());
        return dashboard;
    }

    public List<Map<String, Object>> getRevenueByDay(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<Object[]> results = orderRepository.getRevenueByDay(startDate);
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("date", row[0].toString());
            map.put("revenue", row[1]);
            list.add(map);
        }
        return list;
    }

    public List<Map<String, Object>> getOrdersByDay(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<Object[]> results = orderRepository.getOrdersByDay(startDate);
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("date", row[0].toString());
            map.put("count", row[1]);
            list.add(map);
        }
        return list;
    }
}
