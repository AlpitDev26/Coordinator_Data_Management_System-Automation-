package com.ticclub.dto;

import lombok.Data;

@Data
public class StudentDTO {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String rollNumber;
    private String department;
    private Integer registrationYear;
    private String phoneNumber;
}
