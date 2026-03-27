package com.ticclub.core.dto;

import com.ticclub.core.model.Attendance;
import com.ticclub.core.model.AttendanceStatus;

public record AttendanceDTO(
        Long id,
        Long eventId,
        Long studentId,
        String studentName,
        String studentClubDept,
        String eventTitle,
        AttendanceStatus status,
        java.time.LocalDateTime recordedAt
) {
    public static AttendanceDTO fromEntity(Attendance attendance) {
        return new AttendanceDTO(
                attendance.getId(),
                attendance.getEvent().getId(),
                attendance.getStudent().getId(),
                attendance.getStudent().getFullName(),
                attendance.getStudent().getClubDept(),
                attendance.getEvent().getTitle(),
                attendance.getStatus(),
                attendance.getRecordedAt()
        );
    }
}
