package com.ticclub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticclub.core.dto.AttendanceRequest;
import com.ticclub.core.dto.TeamRequest;
import com.ticclub.core.model.AttendanceStatus;
import com.ticclub.core.model.Event;
import com.ticclub.core.model.Student;
import com.ticclub.core.repository.EventRepository;
import com.ticclub.core.repository.StudentRepository;
import com.ticclub.core.repository.TeamRepository;
import com.ticclub.core.repository.AttendanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ProjectIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private AttendanceRepository attendanceRepository;

    @BeforeEach
    void setup() {
        attendanceRepository.deleteAll();
        teamRepository.deleteAll();
        studentRepository.deleteAll();
        eventRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testStudentCRUD() throws Exception {
        Student student = Student.builder()
                .fullName("Test Student")
                .email("test@student.com")
                .clubDept("Technical")
                .department("Computer Engineering")
                .departmentRole("Member")
                .build();

        // Create
        mockMvc.perform(post("/api/students")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(student)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName", is("Test Student")))
                .andExpect(jsonPath("$.departmentRole", is("Member")));

        // Read
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // Update
        Long id = studentRepository.findAll().get(0).getId();
        student.setFullName("Updated Student");
        mockMvc.perform(put("/api/students/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(student)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName", is("Updated Student")));

        // Delete (Cascading)
        mockMvc.perform(delete("/api/students/" + id))
                .andExpect(status().isNoContent());
        
        mockMvc.perform(get("/api/students"))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testEventCRUD() throws Exception {
        Event event = Event.builder()
                .title("Test Event")
                .description("Test Description")
                .eventDate(LocalDateTime.of(2026, 3, 15, 10, 0))
                .mode("Offline")
                .build();

        // Create
        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(event)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Test Event")));

        // Read
        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // Delete
        Long id = eventRepository.findAll().get(0).getId();
        mockMvc.perform(delete("/api/events/" + id))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testAttendanceLogic() throws Exception {
        // Setup student and event
        Student student = studentRepository.save(Student.builder()
                .fullName("Att Student")
                .email("att@student.com")
                .clubDept("Editorial")
                .build());
        Event event = eventRepository.save(Event.builder()
                .title("Att Event")
                .eventDate(LocalDateTime.now())
                .build());

        AttendanceRequest request = new AttendanceRequest(event.getId(), student.getId(), AttendanceStatus.PRESENT);

        // Mark Attendance
        mockMvc.perform(post("/api/attendance")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentName", is("Att Student")))
                .andExpect(jsonPath("$.status", is("PRESENT")));

        // Get Attendance by Event
        mockMvc.perform(get("/api/attendance/event/" + event.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
                
        // Test cascading delete: Delete student should delete attendance
        mockMvc.perform(delete("/api/students/" + student.getId()))
                .andExpect(status().isNoContent());
                
        mockMvc.perform(get("/api/attendance/event/" + event.getId()))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testTeamCRUD() throws Exception {
        Student s1 = studentRepository.save(Student.builder().fullName("S1").email("s1@e.com").clubDept("R1").build());
        
        TeamRequest teamRequest = new TeamRequest("Test Team", "Description", List.of(s1.getId()));

        // Create Team
        mockMvc.perform(post("/api/teams")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(teamRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Test Team")))
                .andExpect(jsonPath("$.members", hasSize(1)));

        // Update Team
        Long teamId = teamRepository.findAll().get(0).getId();
        TeamRequest updateRequest = new TeamRequest("Updated Team", "New Desc", List.of());
        mockMvc.perform(put("/api/teams/" + teamId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Team")))
                .andExpect(jsonPath("$.members", hasSize(0)));
    }
}
