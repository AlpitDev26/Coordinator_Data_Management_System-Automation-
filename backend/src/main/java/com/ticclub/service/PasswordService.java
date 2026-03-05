package com.ticclub.service;

import com.ticclub.model.User;
import com.ticclub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PasswordService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean initiateForgotPassword(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            String otp = otpService.createOtp(email);
            emailService.sendEmail(email, "Password Reset OTP", 
                "Your OTP for password reset is: " + otp + ". It expires in 5 minutes.");
            return true;
        }
        return false;
    }

    public boolean resetPassword(String email, String otp, String newPassword) {
        if (otpService.validateOtp(email, otp)) {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }
}
