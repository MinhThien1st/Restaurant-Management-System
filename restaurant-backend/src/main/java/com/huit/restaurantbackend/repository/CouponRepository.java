package com.huit.restaurantbackend.repository;

import com.huit.restaurantbackend.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);
    List<Coupon> findByActiveTrue();
}
