package com.ticclub.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "roll_number", unique = true, nullable = false)
    private String rollNumber;

    private String department;

    @Column(name = "registration_year")
    private Integer registrationYear;

    @Column(name = "phone_number")
    private String phoneNumber;
}
