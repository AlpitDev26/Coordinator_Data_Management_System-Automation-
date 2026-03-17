package com.ticclub.controller;

import com.ticclub.core.dto.AttendanceDTO;
import com.ticclub.core.dto.AttendanceRequest;
import com.ticclub.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<List<AttendanceDTO>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByEvent(eventId));
    }

    @PostMapping
    public ResponseEntity<AttendanceDTO> markAttendance(@RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.markAttendance(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }
}
