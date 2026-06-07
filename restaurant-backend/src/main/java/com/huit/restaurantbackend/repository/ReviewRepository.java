package com.huit.restaurantbackend.repository;

import com.huit.restaurantbackend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByFoodIdOrderByCreatedAtDesc(Long foodId);
    List<Review> findByUserId(Long userId);
    long countByFoodId(Long foodId);
    List<Review> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(AVG(cast(r.rating as double)), 0.0) FROM Review r WHERE r.food.id = :foodId")
    double getAverageRatingByFoodId(@Param("foodId") Long foodId);
}
