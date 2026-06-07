package com.huit.restaurantbackend.dto;

import java.time.LocalDate;

public class ReservationRequest {
    private String customerName;
    private String phone;
    private String email;
    private LocalDate reserveDate;
    private String reserveTime;
    private int numGuests;
    private String note;

    // Getters and Setters
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getReserveDate() { return reserveDate; }
    public void setReserveDate(LocalDate reserveDate) { this.reserveDate = reserveDate; }

    public String getReserveTime() { return reserveTime; }
    public void setReserveTime(String reserveTime) { this.reserveTime = reserveTime; }

    public int getNumGuests() { return numGuests; }
    public void setNumGuests(int numGuests) { this.numGuests = numGuests; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
