package com.ticclub.config;

import com.ticclub.core.model.Student;
import com.ticclub.core.model.Team;
import com.ticclub.core.model.User;
import com.ticclub.core.model.UserRole;
import com.ticclub.core.repository.StudentRepository;
import com.ticclub.core.repository.TeamRepository;
import com.ticclub.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedStudentsAndTeams();
    }

    private void seedAdmin() {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setFullName("Admin User");
            admin.setEmail("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ROLE_ADMIN);
            userRepository.save(admin);
            log.info("✅ Default admin user created — username: admin | password: admin123");
        }
    }

    private void seedStudentsAndTeams() {
        if (studentRepository.count() == 0) {
            Student s1 = Student.builder()
                    .fullName("Alpit")
                    .email("alpit@example.com")
                    .rollNumber("TIC001")
                    .department("Computer Science")
                    .registrationYear(2023)
                    .build();

            Student s2 = Student.builder()
                    .fullName("Rahul")
                    .email("rahul@example.com")
                    .rollNumber("TIC002")
                    .department("Information Technology")
                    .registrationYear(2023)
                    .build();

            Student s3 = Student.builder()
                    .fullName("Sneha")
                    .email("sneha@example.com")
                    .rollNumber("TIC003")
                    .department("Data Science")
                    .registrationYear(2024)
                    .build();

            studentRepository.save(s1);
            studentRepository.save(s2);
            studentRepository.save(s3);
            log.info("✅ Sample students created");

            if (teamRepository.count() == 0) {
                Set<Student> devMembers = new HashSet<>();
                devMembers.add(s1);
                devMembers.add(s2);

                Team t1 = Team.builder()
                        .name("Web Dev Team")
                        .description("Team specialized in web technologies.")
                        .members(devMembers)
                        .build();

                Set<Student> aiMembers = new HashSet<>();
                aiMembers.add(s3);

                Team t2 = Team.builder()
                        .name("AI Research")
                        .description("Focused on machine learning and automation.")
                        .members(aiMembers)
                        .build();

                teamRepository.save(t1);
                teamRepository.save(t2);
                log.info("✅ Sample teams created");
            }
        }
    }
}
