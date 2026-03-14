package com.ticclub.core.repository;

import com.ticclub.core.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEventId(Long eventId);
    Optional<Attendance> findByEventIdAndStudentId(Long eventId, Long studentId);
    
    void deleteByEventId(Long eventId);
    void deleteByStudentId(Long studentId);
}
