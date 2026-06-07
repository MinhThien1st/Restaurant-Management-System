package com.huit.restaurantbackend.controller;

import com.huit.restaurantbackend.entity.Food;
import com.huit.restaurantbackend.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/foods")
public class FoodController {

    @Autowired
    private FoodService foodService;

    @GetMapping
    public ResponseEntity<List<Food>> getAll() {
        return ResponseEntity.ok(foodService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Food> getById(@PathVariable Long id) {
        return ResponseEntity.ok(foodService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Food>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(foodService.search(name, categoryId));
    }

    @PostMapping
    public ResponseEntity<Food> create(@RequestBody Food food) {
        return ResponseEntity.ok(foodService.create(food));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Food> update(@PathVariable Long id, @RequestBody Food food) {
        return ResponseEntity.ok(foodService.update(id, food));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        foodService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Xoa mon an thanh cong"));
    }
}