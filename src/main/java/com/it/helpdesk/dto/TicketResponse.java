package com.it.helpdesk.dto;

import com.it.helpdesk.entity.Category;
import com.it.helpdesk.entity.Priority;
import com.it.helpdesk.entity.TicketStatus;
import java.time.LocalDateTime;

public class TicketResponse {

    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private Category category;
    private Priority priority;
    private TicketStatus status;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private String createdByName;
    private String assignedToName;
    private String assignmentNote;

    public TicketResponse(Long id, String ticketNumber, String title, String description,
                          Category category, Priority priority, TicketStatus status,
                          String resolutionNotes, LocalDateTime createdAt,
                          String createdByName, String assignedToName, String assignmentNote) {
        this.id = id;
        this.ticketNumber = ticketNumber;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.resolutionNotes = resolutionNotes;
        this.createdAt = createdAt;
        this.createdByName = createdByName;
        this.assignedToName = assignedToName;
        this.assignmentNote = assignmentNote;
    }

    public Long getId() { return id; }
    public String getTicketNumber() { return ticketNumber; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Category getCategory() { return category; }
    public Priority getPriority() { return priority; }
    public TicketStatus getStatus() { return status; }
    public String getResolutionNotes() { return resolutionNotes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getCreatedByName() { return createdByName; }
    public String getAssignedToName() { return assignedToName; }
    public String getAssignmentNote() { return assignmentNote; }
}