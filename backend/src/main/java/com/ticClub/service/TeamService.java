package com.ticclub.service;

import com.ticclub.core.dto.TeamRequest;
import com.ticclub.core.model.Student;
import com.ticclub.core.model.Team;
import com.ticclub.core.repository.StudentRepository;
import com.ticclub.core.repository.TeamRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final StudentRepository studentRepository;

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Team getTeamById(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + id));
    }

    @Transactional
    public Team createTeam(TeamRequest request) {
        if (teamRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Team with name " + request.name() + " already exists.");
        }
        
        List<Long> busyIds = teamRepository.findAllStudentIdsInTeams();
        for (Long id : request.memberIds()) {
            if (busyIds.contains(id)) {
                Student s = studentRepository.findById(id).orElse(null);
                throw new IllegalArgumentException("Student " + (s != null ? s.getFullName() : id) + " is already in another team!");
            }
        }
        
        Team team = Team.builder()
                .name(request.name())
                .description(request.description())
                .members(fetchStudents(request.memberIds()))
                .build();
                 
        return teamRepository.save(team);
    }

    @Transactional
    public Team updateTeam(Long id, TeamRequest request) {
        Team team = getTeamById(id);
        
        if (!team.getName().equals(request.name()) && teamRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Team with name " + request.name() + " already exists.");
        }

        List<Long> busyIds = teamRepository.findStudentIdsInOtherTeams(id);
        for (Long mid : request.memberIds()) {
            if (busyIds.contains(mid)) {
                Student s = studentRepository.findById(mid).orElse(null);
                throw new IllegalArgumentException("Student " + (s != null ? s.getFullName() : mid) + " is already in another team!");
            }
        }
        
        team.setName(request.name());
        team.setDescription(request.description());
        team.setMembers(fetchStudents(request.memberIds()));
        
        return teamRepository.save(team);
    }

    public void deleteTeam(Long id) {
        if (!teamRepository.existsById(id)) {
            throw new EntityNotFoundException("Team not found with id: " + id);
        }
        teamRepository.deleteById(id);
    }

    private Set<Student> fetchStudents(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return new HashSet<>();
        return new HashSet<>(studentRepository.findAllById(ids));
    }
}
