package com.prj303.backend.controller;

import com.prj303.backend.dto.LoginRequest;
import com.prj303.backend.dto.LoginResponse;
import com.prj303.backend.dto.RegisterRequest;
import com.prj303.backend.entity.User;
import com.prj303.backend.service.UserService;
import com.prj303.backend.security.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            JwtService jwtService) {

        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        User registeredUser = userService.registerUser(user);

        return ResponseEntity.ok(
                new LoginResponse(
                        registeredUser.getId(),
                        registeredUser.getName(),
                        registeredUser.getEmail(),
                        registeredUser.getRole(),
                        null));
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

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole());

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token);

        return ResponseEntity.ok(response);
    }
}