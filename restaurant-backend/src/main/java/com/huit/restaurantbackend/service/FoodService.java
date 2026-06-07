package com.huit.restaurantbackend.service;

import com.huit.restaurantbackend.entity.Category;
import com.huit.restaurantbackend.entity.Food;
import com.huit.restaurantbackend.exception.ResourceNotFoundException;
import com.huit.restaurantbackend.repository.CategoryRepository;
import com.huit.restaurantbackend.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodService {

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Food> getAll() {
        return foodRepository.findAll();
    }

    public Food getById(Long id) {
        return foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay mon an voi id = " + id));
    }

    public Food create(Food food) {
        if (food.getCategory() != null && food.getCategory().getId() != null) {
            Category cat = categoryRepository.findById(food.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc"));
            food.setCategory(cat);
        }
        return foodRepository.save(food);
    }

    public Food update(Long id, Food food) {
        Food existing = getById(id);
        existing.setName(food.getName());
        existing.setDescription(food.getDescription());
        existing.setPrice(food.getPrice());
        existing.setImageUrl(food.getImageUrl());
        if (food.getCategory() != null && food.getCategory().getId() != null) {
            Category cat = categoryRepository.findById(food.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc"));
            existing.setCategory(cat);
        }
        return foodRepository.save(existing);
    }

    public void delete(Long id) {
        getById(id);
        foodRepository.deleteById(id);
    }

    public List<Food> search(String name, Long categoryId) {
        if (name != null && categoryId != null) {
            return foodRepository.findByNameContainingIgnoreCaseAndCategoryId(name, categoryId);
        } else if (name != null) {
            return foodRepository.findByNameContainingIgnoreCase(name);
        } else if (categoryId != null) {
            return foodRepository.findByCategoryId(categoryId);
        } else {
            return foodRepository.findAll();
        }
    }
}