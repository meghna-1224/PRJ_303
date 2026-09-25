package com.prj303.backend.controller;

import com.prj303.backend.dto.LoginRequest;
import com.prj303.backend.dto.RegisterRequest;
import com.prj303.backend.entity.User;
import com.prj303.backend.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        User registeredUser = userService.registerUser(user);

        Map<String, Object> response = new HashMap<>();

        response.put("id", registeredUser.getId());
        response.put("name", registeredUser.getName());
        response.put("email", registeredUser.getEmail());
        response.put("role", registeredUser.getRole());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        boolean valid = userService.loginUser(
                request.getEmail(),
                request.getPassword());

        if (!valid) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid email or password");
        }

        User user = userService.getUserByEmail(
                request.getEmail());

        Map<String, Object> response = new HashMap<>();

        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
}