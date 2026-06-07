package com.huit.restaurantbackend.repository;

import com.huit.restaurantbackend.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodRepository extends JpaRepository<Food, Long> {
    List<Food> findByNameContainingIgnoreCase(String name);
    List<Food> findByCategoryId(Long categoryId);
    List<Food> findByNameContainingIgnoreCaseAndCategoryId(String name, Long categoryId);
    boolean existsByCategoryId(Long categoryId);
}