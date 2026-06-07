package com.huit.restaurantbackend.service;

import com.huit.restaurantbackend.dto.ReviewRequest;
import com.huit.restaurantbackend.entity.Food;
import com.huit.restaurantbackend.entity.Review;
import com.huit.restaurantbackend.entity.User;
import com.huit.restaurantbackend.exception.BadRequestException;
import com.huit.restaurantbackend.exception.ResourceNotFoundException;
import com.huit.restaurantbackend.repository.FoodRepository;
import com.huit.restaurantbackend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private FoodRepository foodRepository;

    public Review createReview(ReviewRequest request, User user) {
        if (request.getFoodId() == null) {
            throw new BadRequestException("Mon an khong duoc de trong");
        }
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Diem danh gia phai tu 1 den 5 sao");
        }

        Food food = foodRepository.findById(request.getFoodId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay mon an voi id = " + request.getFoodId()));

        Review review = new Review();
        review.setFood(food);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        return reviewRepository.save(review);
    }

    public List<Review> getByFoodId(Long foodId) {
        return reviewRepository.findByFoodIdOrderByCreatedAtDesc(foodId);
    }

    public List<Review> getAll() {
        return reviewRepository.findAllByOrderByCreatedAtDesc();
    }

    public double getAverageRating(Long foodId) {
        return reviewRepository.getAverageRatingByFoodId(foodId);
    }

    public void deleteReview(Long id, User user) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh gia voi id = " + id));

        if (!"ADMIN".equals(user.getRole()) && !review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Ban khong co quyen xoa danh gia nay");
        }

        reviewRepository.delete(review);
    }
}
