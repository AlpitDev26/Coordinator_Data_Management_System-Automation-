package com.ticclub.service;

import com.ticclub.util.OtpGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    @Autowired
    private OtpGenerator otpGenerator;

    private final ConcurrentHashMap<String, OtpDetails> otpCache = new ConcurrentHashMap<>();

    private static class OtpDetails {
        String code;
        LocalDateTime expiry;

        OtpDetails(String code, LocalDateTime expiry) {
            this.code = code;
            this.expiry = expiry;
        }
    }

    public String createOtp(String email) {
        String code = otpGenerator.generateOtp();
        otpCache.put(email, new OtpDetails(code, LocalDateTime.now().plusMinutes(5)));
        return code;
    }

    public boolean validateOtp(String email, String code) {
        OtpDetails details = otpCache.get(email);
        if (details != null && details.code.equals(code) && details.expiry.isAfter(LocalDateTime.now())) {
            otpCache.remove(email);
            return true;
        }
        return false;
    }
}
