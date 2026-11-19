
package com.prj303.backend.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetService {

    private final UserService userService;
    private final EmailService emailService;
    private final BCryptPasswordEncoder otpEncoder;
    private final SecureRandom secureRandom;

    private final ConcurrentMap<String, OtpData> otpStore = new ConcurrentHashMap<>();

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RESET_TOKEN_EXPIRY_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;

    public PasswordResetService(
            UserService userService,
            EmailService emailService) {

        this.userService = userService;
        this.emailService = emailService;
        this.otpEncoder = new BCryptPasswordEncoder();
        this.secureRandom = new SecureRandom();
    }

    public void generateOtp(String email) {

        if (userService.getUserByEmail(email) == null) {
            return;
        }

        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000));

        String hashedOtp = otpEncoder.encode(otp);

        OtpData otpData = new OtpData(
                hashedOtp,
                Instant.now().plusSeconds(OTP_EXPIRY_MINUTES * 60L));

        otpStore.put(email, otpData);

        try {
            emailService.sendOtpEmail(email, otp);
        } catch (RuntimeException e) {
            otpStore.remove(email, otpData);
            throw new IllegalStateException(
                    "Unable to send OTP email. Please try again.", e);
        }
    }

    public String verifyOtp(String email, String otp) {

        OtpData data = otpStore.get(email);

        if (data == null) {
            return null;
        }

        if (Instant.now().isAfter(data.expiryTime)) {
            otpStore.remove(email, data);
            return null;
        }

        if (data.verified || data.attempts >= MAX_ATTEMPTS) {
            return null;
        }

        data.attempts++;

        if (!otpEncoder.matches(otp, data.hashedOtp)) {

            if (data.attempts >= MAX_ATTEMPTS) {
                otpStore.remove(email, data);
            }

            return null;
        }

        data.verified = true;

        // Generate a cryptographically secure reset token.
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String resetToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        data.hashedResetToken = otpEncoder.encode(resetToken);

        data.resetTokenExpiry = Instant.now().plusSeconds(
                RESET_TOKEN_EXPIRY_MINUTES * 60L);

        return resetToken;
    }

    public void resetPassword(
            String email,
            String resetToken,
            String newPassword) {

        OtpData data = otpStore.get(email);

        if (data == null ||
                !data.verified ||
                data.hashedResetToken == null ||
                data.resetTokenExpiry == null ||
                Instant.now().isAfter(data.resetTokenExpiry) ||
                !otpEncoder.matches(resetToken, data.hashedResetToken)) {

            throw new IllegalArgumentException(
                    "Invalid or expired password reset authorization.");
        }

        userService.resetPassword(email, newPassword);

        // Invalidate OTP and reset token after successful password change.
        otpStore.remove(email, data);
    }

    private static class OtpData {

        private final String hashedOtp;
        private final Instant expiryTime;

        private int attempts;
        private boolean verified;

        private String hashedResetToken;
        private Instant resetTokenExpiry;

        private OtpData(String hashedOtp, Instant expiryTime) {
            this.hashedOtp = hashedOtp;
            this.expiryTime = expiryTime;
            this.attempts = 0;
            this.verified = false;
        }
    }
}
