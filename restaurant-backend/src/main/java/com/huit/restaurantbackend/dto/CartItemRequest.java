package com.huit.restaurantbackend.dto;

public class CartItemRequest {
    private Long foodId;
    private int quantity;

    public Long getFoodId() { return foodId; }
    public void setFoodId(Long foodId) { this.foodId = foodId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
