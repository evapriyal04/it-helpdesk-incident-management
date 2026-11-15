package com.it.helpdesk.service;

import com.it.helpdesk.dto.UserResponse;
import com.it.helpdesk.entity.Role;
import com.it.helpdesk.entity.User;
import com.it.helpdesk.exception.BadRequestException;
import com.it.helpdesk.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse createUser(User user) {
        // Business rule: every IT agent must belong to a support team
        if (user.getRole() == Role.IT_AGENT && user.getSupportTeam() == null) {
            throw new BadRequestException("IT agents must belong to a support team");
        }
        // Employees and admins have no support team
        if (user.getRole() != Role.IT_AGENT) {
            user.setSupportTeam(null);
        }

        user.setCreatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public List<UserResponse> getAllUsers() {
        List<UserResponse> result = new ArrayList<>();
        for (User user : userRepository.findAll()) {
            result.add(toResponse(user));
        }
        return result;
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(),
                user.getRole(), user.getSupportTeam());
    }
}