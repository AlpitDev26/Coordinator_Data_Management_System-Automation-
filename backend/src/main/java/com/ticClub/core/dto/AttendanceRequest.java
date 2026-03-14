package com.ticclub.core.dto;

import com.ticclub.core.model.AttendanceStatus;

public record AttendanceRequest(Long eventId, Long studentId, AttendanceStatus status) {}
