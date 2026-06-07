package com.huit.restaurantbackend.controller;

import com.huit.restaurantbackend.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        
        Double revenue;
        if (from != null && to != null) {
            revenue = statisticsService.getRevenueBetween(from, to);
            return ResponseEntity.ok(Map.of(
                "totalRevenue", revenue,
                "from", from,
                "to", to
            ));
        } else {
            revenue = statisticsService.getTotalRevenue();
            return ResponseEntity.ok(Map.of(
                "totalRevenue", revenue != null ? revenue : 0.0
            ));
        }
    }

    @GetMapping("/orders-summary")
    public ResponseEntity<Map<String, Long>> getOrdersSummary() {
        return ResponseEntity.ok(statisticsService.getOrdersSummary());
    }

    @GetMapping("/top-foods")
    public ResponseEntity<List<Map<String, Object>>> getTopFoods(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(statisticsService.getTopFoods(limit));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(statisticsService.getDashboard());
    }

    @GetMapping("/revenue-by-day")
    public ResponseEntity<List<Map<String, Object>>> getRevenueByDay(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(statisticsService.getRevenueByDay(days));
    }

    @GetMapping("/orders-by-day")
    public ResponseEntity<List<Map<String, Object>>> getOrdersByDay(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(statisticsService.getOrdersByDay(days));
    }
}
