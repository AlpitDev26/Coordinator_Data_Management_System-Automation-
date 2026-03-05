package com.ticclub.controller;

import com.ticclub.model.Attendance;
import com.ticclub.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    @Autowired
    private AttendanceService attendanceService;

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN')")
    public List<Attendance> getAttendanceByEvent(@PathVariable Long eventId) {
        return attendanceService.getAttendanceByEvent(eventId);
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN')")
    public Attendance markAttendance(@RequestBody Attendance attendance) {
        return attendanceService.markAttendance(attendance);
    }
}
