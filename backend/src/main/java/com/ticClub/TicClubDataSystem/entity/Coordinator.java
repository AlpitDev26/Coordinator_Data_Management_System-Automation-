package com.ticclub.TicClubDataSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // Tells Hibernate: "Make a database table out of this class"
@Table(name = "coordinators") // Names the table "coordinators" in PostgreSQL
@Data // Lombok: Automatically creates Getters, Setters, and toString() behind the scenes
@NoArgsConstructor // Lombok: Creates an empty constructor 
@AllArgsConstructor // Lombok: Creates a constructor with all fields
public class Coordinator {

    @Id // Tells Hibernate this is the Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tells PostgreSQL to Auto-Increment the ID (1, 2, 3...)
    private Long id;

    @Column(nullable = false) // This column cannot be null (empty)
    private String name;

    @Column(nullable = false, unique = true) // Emails must be required AND unique
    private String email;

    @Column(nullable = false)
    private String password; // We will encrypt/hash this later in the Security phase

    @Column(nullable = false)
    private String role; // Used for RBAC later. Example: "ROLE_ADMIN" or "ROLE_COORDINATOR"

    private String phoneNumber; // Optional field, so no @Column rules needed
}
