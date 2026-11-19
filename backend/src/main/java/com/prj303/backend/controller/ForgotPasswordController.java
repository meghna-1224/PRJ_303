
package com.prj303.backend.controller;

import com.prj303.backend.dto.ForgotPasswordRequest;
import com.prj303.backend.dto.VerifyOtpRequest;
import com.prj303.backend.dto.ResetPasswordRequest;
import com.prj303.backend.service.PasswordResetService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ForgotPasswordController {

    private final PasswordResetService passwordResetService;

    public ForgotPasswordController(
            PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        try {
            passwordResetService.generateOtp(request.getEmail());

            return ResponseEntity.ok(
                    "If the account exists, an OTP has been sent to the registered email.");

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Unable to send OTP. Please try again.");
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody VerifyOtpRequest request) {

        String resetToken = passwordResetService.verifyOtp(
                request.getEmail(),
                request.getOtp());

        if (resetToken == null) {
            return ResponseEntity.badRequest()
                    .body("Invalid or expired OTP.");
        }

        return ResponseEntity.ok(
                Map.of(
                        "message", "OTP verified successfully.",
                        "resetToken", resetToken));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        try {
            passwordResetService.resetPassword(
                    request.getEmail(),
                    request.getResetToken(),
                    request.getNewPassword());

            return ResponseEntity.ok("Password reset successfully.");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Unable to reset password. Please try again.");
        }
    }
}
