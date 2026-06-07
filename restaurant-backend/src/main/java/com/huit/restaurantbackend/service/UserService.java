package com.huit.restaurantbackend.service;

import com.huit.restaurantbackend.dto.ChangePasswordRequest;
import com.huit.restaurantbackend.entity.User;
import com.huit.restaurantbackend.exception.BadRequestException;
import com.huit.restaurantbackend.exception.DuplicateResourceException;
import com.huit.restaurantbackend.exception.ResourceNotFoundException;
import com.huit.restaurantbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + id));
    }

    public User update(Long id, User user) {
        User existing = getById(id);
        if (user.getEmail() != null && !user.getEmail().equals(existing.getEmail())) {
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new DuplicateResourceException("Email da duoc su dung");
            }
            existing.setEmail(user.getEmail());
        }
        if (user.getFullName() != null) existing.setFullName(user.getFullName());
        if (user.getPhone() != null) existing.setPhone(user.getPhone());
        if (user.getRole() != null) existing.setRole(user.getRole());
        if (user.getAvatarUrl() != null) existing.setAvatarUrl(user.getAvatarUrl());
        return userRepository.save(existing);
    }

    public void delete(Long id) {
        getById(id);
        userRepository.deleteById(id);
    }

    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = getById(id);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Sai mat khau cu");
        }
        if (request.getNewPassword().length() < 6) {
            throw new BadRequestException("Mat khau moi phai co it nhat 6 ky tu");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
