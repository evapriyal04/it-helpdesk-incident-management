package com.it.helpdesk.controller;

import com.it.helpdesk.dto.AssignRequest;
import com.it.helpdesk.dto.RecommendationResponse;
import com.it.helpdesk.dto.StatusUpdateRequest;
import com.it.helpdesk.dto.TicketRequest;
import com.it.helpdesk.dto.TicketResponse;
import com.it.helpdesk.dto.TicketUpdateRequest;
import com.it.helpdesk.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody TicketRequest request) {
        TicketResponse created = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets();
        return ResponseEntity.status(HttpStatus.OK).body(tickets);
    }

    @GetMapping("/search")
    public ResponseEntity<TicketResponse> searchByTicketNumber(@RequestParam("ticketNumber") String ticketNumber) {
        TicketResponse ticket = ticketService.searchByTicketNumber(ticketNumber);
        return ResponseEntity.status(HttpStatus.OK).body(ticket);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable("id") Long id) {
        TicketResponse ticket = ticketService.getTicketById(id);
        return ResponseEntity.status(HttpStatus.OK).body(ticket);
    }

    @GetMapping("/{id}/recommendation")
    public ResponseEntity<RecommendationResponse> getRecommendation(@PathVariable("id") Long id) {
        RecommendationResponse recommendation = ticketService.getRecommendation(id);
        return ResponseEntity.status(HttpStatus.OK).body(recommendation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(@PathVariable("id") Long id,
                                                       @Valid @RequestBody TicketUpdateRequest request) {
        TicketResponse updated = ticketService.updateTicket(id, request);
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(@PathVariable("id") Long id,
                                                       @Valid @RequestBody AssignRequest request) {
        TicketResponse updated = ticketService.assignTicket(id, request);
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable("id") Long id,
                                                       @Valid @RequestBody StatusUpdateRequest request) {
        TicketResponse updated = ticketService.updateStatus(id, request);
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable("id") Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}