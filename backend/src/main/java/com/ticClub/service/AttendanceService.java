package com.ticclub.service;

import com.ticclub.core.dto.AttendanceDTO;
import com.ticclub.core.dto.AttendanceRequest;
import com.ticclub.core.model.Attendance;
import com.ticclub.core.model.Event;
import com.ticclub.core.model.Student;
import com.ticclub.core.repository.AttendanceRepository;
import com.ticclub.core.repository.EventRepository;
import com.ticclub.core.repository.StudentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EventRepository eventRepository;
    private final StudentRepository studentRepository;

    public List<AttendanceDTO> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(AttendanceDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Event not found with id: " + eventId);
        }
        return attendanceRepository.findByEventId(eventId).stream()
                .map(AttendanceDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDTO markAttendance(AttendanceRequest request) {
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + request.eventId()));
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + request.studentId()));

        Attendance attendance = attendanceRepository.findByEventIdAndStudentId(request.eventId(), request.studentId())
                .orElse(Attendance.builder().event(event).student(student).build());

        attendance.setStatus(request.status());
        Attendance saved = attendanceRepository.save(attendance);
        return AttendanceDTO.fromEntity(saved);
    }

    @Transactional
    public void deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new EntityNotFoundException("Attendance record not found with id: " + id);
        }
        attendanceRepository.deleteById(id);
    }
}
