package com.ticclub.controller;

import com.ticclub.dto.ForgotPasswordRequest;
import com.ticclub.dto.MessageResponse;
import com.ticclub.dto.VerifyOtpRequest;
import com.ticclub.service.PasswordService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/password")
public class PasswordController {
    @Autowired
    private PasswordService passwordService;

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        if (passwordService.initiateForgotPassword(request.getEmail())) {
            return ResponseEntity.ok(new MessageResponse("OTP sent to your email."));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Email not found."));
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody VerifyOtpRequest request) {
        if (passwordService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword())) {
            return ResponseEntity.ok(new MessageResponse("Password reset successful."));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid OTP or session expired."));
    }
}
