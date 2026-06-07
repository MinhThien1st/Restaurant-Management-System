package com.huit.restaurantbackend.service;

import com.huit.restaurantbackend.entity.Coupon;
import com.huit.restaurantbackend.exception.BadRequestException;
import com.huit.restaurantbackend.exception.DuplicateResourceException;
import com.huit.restaurantbackend.exception.ResourceNotFoundException;
import com.huit.restaurantbackend.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public Coupon createCoupon(Coupon coupon) {
        if (coupon.getCode() == null || coupon.getCode().trim().isEmpty()) {
            throw new BadRequestException("Ma giam gia khong duoc de trong");
        }
        if (coupon.getDiscountPercent() <= 0 || coupon.getDiscountPercent() > 100) {
            throw new BadRequestException("Phan tram giam gia phai tu 1% den 100%");
        }
        if (couponRepository.findByCode(coupon.getCode().toUpperCase()).isPresent()) {
            throw new DuplicateResourceException("Ma giam gia nay da ton tai");
        }

        coupon.setCode(coupon.getCode().toUpperCase());
        coupon.setUsedCount(0);
        return couponRepository.save(coupon);
    }

    public List<Coupon> getAll() {
        return couponRepository.findAll();
    }

    public Coupon validateCoupon(String code, double orderAmount) {
        if (code == null || code.trim().isEmpty()) {
            throw new BadRequestException("Ma giam gia khong duoc de trong");
        }

        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Ma giam gia khong hop le"));

        if (!coupon.isActive()) {
            throw new BadRequestException("Ma giam gia nay da bi vo hieu hoa");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Ma giam gia da het han su dung");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Ma giam gia da het luot su dung");
        }

        if (orderAmount < coupon.getMinOrderAmount()) {
            throw new BadRequestException("Don hang chua dat gia tri toi thieu de ap dung ma nay (" + coupon.getMinOrderAmount() + ")");
        }

        return coupon;
    }

    public double calculateDiscount(Coupon coupon, double orderAmount) {
        double discount = orderAmount * (coupon.getDiscountPercent() / 100.0);
        if (coupon.getMaxDiscount() > 0 && discount > coupon.getMaxDiscount()) {
            discount = coupon.getMaxDiscount();
        }
        return discount;
    }

    public void incrementUsedCount(String code) {
        couponRepository.findByCode(code.toUpperCase()).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        });
    }

    public Coupon toggleActive(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay ma giam gia voi id = " + id));
        coupon.setActive(!coupon.isActive());
        return couponRepository.save(coupon);
    }

    public void delete(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay ma giam gia voi id = " + id));
        couponRepository.delete(coupon);
    }
}
