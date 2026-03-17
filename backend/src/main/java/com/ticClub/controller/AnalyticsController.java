package com.ticclub.controller;

import com.ticclub.core.repository.AttendanceRepository;
import com.ticclub.core.repository.EventRepository;
import com.ticclub.core.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final StudentRepository studentRepository;
    private final EventRepository eventRepository;
    private final AttendanceRepository attendanceRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalStudents", studentRepository.count());
        summary.put("totalEvents", eventRepository.count());
        summary.put("totalAttendanceRecords", attendanceRepository.count());
        
        // Mock data for Chart.js frontend requirements
        summary.put("attendanceTrends", new int[]{80, 95, 70, 110, 85, 120}); 
        summary.put("eventLabels", new String[]{"Jan", "Feb", "Mar", "Apr", "May", "Jun"});
        
        return ResponseEntity.ok(summary);
    }
}
