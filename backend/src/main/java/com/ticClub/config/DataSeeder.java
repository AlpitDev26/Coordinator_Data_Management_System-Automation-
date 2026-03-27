package com.ticclub.config;

import com.ticclub.core.model.Student;
import com.ticclub.core.model.Team;
import com.ticclub.core.model.AttendanceStatus;
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
    private final com.ticclub.core.repository.EventRepository eventRepository;
    private final com.ticclub.core.repository.AttendanceRepository attendanceRepository;
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
        attendanceRepository.deleteAll();
        teamRepository.deleteAll();
        studentRepository.deleteAll();
        eventRepository.deleteAll();

        if (true) { // Force seed every time for now or depend on count
            // All combinations of Dept and Branch
            Student s1 = Student.builder().fullName("Alpit").email("alpit@example.com").clubDept("Technical").department("Computer Engineering").departmentRole("Coordinator").build();
            Student s2 = Student.builder().fullName("Rahul").email("rahul@example.com").clubDept("Event Management").department("Information Technology").departmentRole("Co-Coordinator").build();
            Student s3 = Student.builder().fullName("Sneha").email("sneha@example.com").clubDept("Research & Development").department("Artificial Intelligence & Data Science").departmentRole("Lead").build();
            Student s4 = Student.builder().fullName("Anya").email("anya@example.com").clubDept("Social Media").department("Information Technology").departmentRole("Admin").build();
            Student s5 = Student.builder().fullName("Kabir").email("kabir@example.com").clubDept("Documentation").department("Artificial Intelligence & Data Science").departmentRole("Coordinator").build();
            Student s6 = Student.builder().fullName("Meera").email("meera@example.com").clubDept("Administration").department("Computer Engineering").departmentRole("President").build();
            Student s7 = Student.builder().fullName("Rohan").email("rohan@example.com").clubDept("Technical").department("Computer Science (Data Science)").departmentRole("Department Head").build();

            studentRepository.saveAll(java.util.List.of(s1, s2, s3, s4, s5, s6, s7));
            log.info("✅ Sample students created");

            // Seed Events
            if (eventRepository.count() == 0) {
                com.ticclub.core.model.Event e1 = com.ticclub.core.model.Event.builder().title("Tech Workshop").description("AI/ML Fundamentals").mode("Offline").hostDept("Technical").hostedBy("Alpit").eventDate(java.time.LocalDateTime.now().plusDays(2)).build();
                com.ticclub.core.model.Event e2 = com.ticclub.core.model.Event.builder().title("Orientation 2026").description("Introduction to TIC Club").mode("Offline").hostDept("Administration").hostedBy("Meera").eventDate(java.time.LocalDateTime.now().minusDays(5)).build();
                com.ticclub.core.model.Event e3 = com.ticclub.core.model.Event.builder().title("Code Sprint").description("48-hour Hackathon").mode("Offline").hostDept("Technical").hostedBy("Rohan").eventDate(java.time.LocalDateTime.now().plusWeeks(1)).build();
                
                eventRepository.saveAll(java.util.List.of(e1, e2, e3));
                log.info("✅ Sample events created");

                // Seed Attendance for the past event (Orientation 2026)
                if (attendanceRepository.count() == 0) {
                    attendanceRepository.save(com.ticclub.core.model.Attendance.builder().event(e2).student(s1).status(AttendanceStatus.PRESENT).build());
                    attendanceRepository.save(com.ticclub.core.model.Attendance.builder().event(e2).student(s2).status(AttendanceStatus.PRESENT).build());
                    attendanceRepository.save(com.ticclub.core.model.Attendance.builder().event(e2).student(s3).status(AttendanceStatus.LATE).build());
                    attendanceRepository.save(com.ticclub.core.model.Attendance.builder().event(e2).student(s4).status(AttendanceStatus.ABSENT).build());
                    log.info("✅ Sample attendance created");
                }
            }

            if (teamRepository.count() == 0) {
                Set<Student> devMembers = new HashSet<>();
                devMembers.add(s1); devMembers.add(s7);
                Team t1 = Team.builder().name("Core Tech").description("The central engineering unit.").members(devMembers).build();

                Set<Student> leadership = new HashSet<>();
                leadership.add(s6); leadership.add(s3);
                Team t2 = Team.builder().name("Executive Council").description("Club leadership and strategy.").members(leadership).build();

                teamRepository.saveAll(java.util.List.of(t1, t2));
                log.info("✅ Sample teams created");
            }
        }
    }
}
