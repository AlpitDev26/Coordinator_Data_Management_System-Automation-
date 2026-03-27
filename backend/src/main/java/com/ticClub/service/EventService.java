package com.ticclub.service;

import com.ticclub.core.model.Event;
import com.ticclub.core.repository.AttendanceRepository;
import com.ticclub.core.repository.EventRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final AttendanceRepository attendanceRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));
    }

    public Event createEvent(Event event) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        if (event.getHostedBy() == null) event.setHostedBy(currentUser);
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event eventDetails) {
        Event event = getEventById(id);
        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setEventDate(eventDetails.getEventDate());
        event.setMode(eventDetails.getMode());
        event.setHostedBy(eventDetails.getHostedBy());
        event.setHostDept(eventDetails.getHostDept());
        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EntityNotFoundException("Event not found with id: " + id);
        }
        // Delete associated attendance records first to avoid FK constraint violation
        attendanceRepository.deleteByEventId(id);
        eventRepository.deleteById(id);
    }
}
