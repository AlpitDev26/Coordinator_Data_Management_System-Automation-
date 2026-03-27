package com.ticclub.core.repository;

import com.ticclub.core.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByName(String name);
    boolean existsByName(String name);
    
    @Modifying
    @Query(value = "DELETE FROM team_members WHERE student_id = :studentId", nativeQuery = true)
    void removeStudentFromAllTeams(@Param("studentId") Long studentId);

    @Query(value = "SELECT student_id FROM team_members WHERE team_id <> :excludeTeamId", nativeQuery = true)
    java.util.List<Long> findStudentIdsInOtherTeams(@Param("excludeTeamId") Long excludeTeamId);

    @Query(value = "SELECT student_id FROM team_members", nativeQuery = true)
    java.util.List<Long> findAllStudentIdsInTeams();
}
