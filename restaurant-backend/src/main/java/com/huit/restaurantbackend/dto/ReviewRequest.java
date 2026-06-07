package com.huit.restaurantbackend.dto;

public class ReviewRequest {
    private Long foodId;
    private int rating;
    private String comment;

    // Getters and Setters
    public Long getFoodId() { return foodId; }
    public void setFoodId(Long foodId) { this.foodId = foodId; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
