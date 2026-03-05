package com.ticclub.service;

import com.ticclub.repository.StudentRepository;
import com.ticclub.repository.TeamRepository;
import com.ticclub.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private EventRepository eventRepository;

    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalStudents", studentRepository.count());
        stats.put("totalTeams", teamRepository.count());
        stats.put("totalEvents", eventRepository.count());
        return stats;
    }
}
