package com.huit.restaurantbackend.service;

import com.huit.restaurantbackend.entity.Category;
import com.huit.restaurantbackend.exception.BadRequestException;
import com.huit.restaurantbackend.exception.DuplicateResourceException;
import com.huit.restaurantbackend.exception.ResourceNotFoundException;
import com.huit.restaurantbackend.repository.CategoryRepository;
import com.huit.restaurantbackend.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FoodRepository foodRepository;

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc voi id = " + id));
    }

    public Category create(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new DuplicateResourceException("Ten danh muc da ton tai");
        }
        return categoryRepository.save(category);
    }

    public Category update(Long id, Category category) {
        Category existing = getById(id);
        existing.setName(category.getName());
        return categoryRepository.save(existing);
    }

    public void delete(Long id) {
        getById(id);
        if (foodRepository.existsByCategoryId(id)) {
            throw new BadRequestException("Khong the xoa danh muc dang co mon an");
        }
        categoryRepository.deleteById(id);
    }
}