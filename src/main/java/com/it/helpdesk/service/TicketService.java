package com.it.helpdesk.service;

import com.it.helpdesk.dto.AssignRequest;
import com.it.helpdesk.dto.RecommendationResponse;
import com.it.helpdesk.dto.StatusUpdateRequest;
import com.it.helpdesk.dto.TicketRequest;
import com.it.helpdesk.dto.TicketResponse;
import com.it.helpdesk.dto.TicketUpdateRequest;
import com.it.helpdesk.entity.Role;
import com.it.helpdesk.entity.SupportTeam;
import com.it.helpdesk.entity.Ticket;
import com.it.helpdesk.entity.TicketStatus;
import com.it.helpdesk.entity.User;
import com.it.helpdesk.exception.BadRequestException;
import com.it.helpdesk.exception.ResourceNotFoundException;
import com.it.helpdesk.repository.TicketRepository;
import com.it.helpdesk.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final AssignmentService assignmentService;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository,
                         AssignmentService assignmentService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.assignmentService = assignmentService;
    }

    // ---------- Helper methods (find or throw an exception) ----------

    private Ticket findTicketOrThrow(Long id) {
        Optional<Ticket> optional = ticketRepository.findById(id);
        if (!optional.isPresent()) {
            throw new ResourceNotFoundException("Ticket not found with id " + id);
        }
        return optional.get();
    }

    private User findUserOrThrow(Long id) {
        Optional<User> optional = userRepository.findById(id);
        if (!optional.isPresent()) {
            throw new ResourceNotFoundException("User not found with id " + id);
        }
        return optional.get();
    }

    private String teamName(User agent) {
        if (agent.getSupportTeam() == null) {
            return "no support team";
        }
        return agent.getSupportTeam().getDisplayName();
    }

    // ---------- Create ----------

    public TicketResponse createTicket(TicketRequest request) {
        User creator = findUserOrThrow(request.getCreatedById());

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setCreatedBy(creator);

        Ticket saved = ticketRepository.save(ticket);

        // Ticket ID generation: build a TKT-1001 style number from the database id
        saved.setTicketNumber("TKT-" + (1000 + saved.getId()));
        saved = ticketRepository.save(saved);

        return toResponse(saved);
    }

    // ---------- Read ----------

    public List<TicketResponse> getAllTickets() {
        List<TicketResponse> result = new ArrayList<>();
        for (Ticket ticket : ticketRepository.findAll()) {
            result.add(toResponse(ticket));
        }
        return result;
    }

    public TicketResponse getTicketById(Long id) {
        Ticket ticket = findTicketOrThrow(id);
        return toResponse(ticket);
    }

    public TicketResponse searchByTicketNumber(String ticketNumber) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber);
        if (ticket == null) {
            throw new ResourceNotFoundException("Ticket not found with number " + ticketNumber);
        }
        return toResponse(ticket);
    }

    // The smart routing recommendation for one ticket
    public RecommendationResponse getRecommendation(Long id) {
        Ticket ticket = findTicketOrThrow(id);
        return assignmentService.getRecommendation(ticket);
    }

    // ---------- Update ----------

    public TicketResponse updateTicket(Long id, TicketUpdateRequest request) {
        Ticket ticket = findTicketOrThrow(id);

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());

        Ticket saved = ticketRepository.save(ticket);
        return toResponse(saved);
    }

    public TicketResponse assignTicket(Long id, AssignRequest request) {
        Ticket ticket = findTicketOrThrow(id);
        User agent = findUserOrThrow(request.getAgentId());

        if (agent.getRole() != Role.IT_AGENT) {
            throw new BadRequestException("Tickets can only be assigned to an IT agent");
        }

        // Smart routing: does the agent's team match the team this category belongs to?
        SupportTeam recommended = assignmentService.getRecommendedTeam(ticket.getCategory());
        boolean mismatch = agent.getSupportTeam() != recommended;

        if (mismatch && !request.isOverrideMismatch()) {
            throw new BadRequestException("Assignment mismatch: this ticket belongs to "
                    + recommended.getDisplayName() + ", but " + agent.getFullName()
                    + " belongs to " + teamName(agent)
                    + ". Recommended action: assign to " + recommended.getDisplayName() + ".");
        }

        // A reason is needed when transferring a ticket or overriding the recommendation
        boolean reassignment = ticket.getAssignedTo() != null;
        String reason = request.getReassignmentReason();
        boolean reasonMissing = reason == null || reason.trim().isEmpty();

        if ((reassignment || mismatch) && reasonMissing) {
            throw new BadRequestException(
                    "A reason is required when reassigning a ticket or overriding the recommended team");
        }

        ticket.setAssignedTo(agent);
        if (reasonMissing) {
            ticket.setAssignmentNote(null);
        } else {
            ticket.setAssignmentNote(reason.trim());
        }

        Ticket saved = ticketRepository.save(ticket);
        return toResponse(saved);
    }

    public TicketResponse updateStatus(Long id, StatusUpdateRequest request) {
        Ticket ticket = findTicketOrThrow(id);

        if (request.getStatus() == TicketStatus.RESOLVED) {
            String notes = request.getResolutionNotes();
            if (notes == null || notes.trim().isEmpty()) {
                throw new BadRequestException("Resolution notes are required to resolve a ticket");
            }
            ticket.setResolutionNotes(notes);
        }

        ticket.setStatus(request.getStatus());
        Ticket saved = ticketRepository.save(ticket);
        return toResponse(saved);
    }

    // ---------- Delete ----------

    public void deleteTicket(Long id) {
        Ticket ticket = findTicketOrThrow(id);

        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new BadRequestException("Only OPEN tickets can be deleted");
        }

        ticketRepository.deleteById(id);
    }

    // ---------- Entity to DTO conversion ----------

    private TicketResponse toResponse(Ticket ticket) {
        String assignedName = null;
        if (ticket.getAssignedTo() != null) {
            assignedName = ticket.getAssignedTo().getFullName();
        }
        return new TicketResponse(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getCategory(),
                ticket.getPriority(),
                ticket.getStatus(),
                ticket.getResolutionNotes(),
                ticket.getCreatedAt(),
                ticket.getCreatedBy().getFullName(),
                assignedName,
                ticket.getAssignmentNote());
    }
}