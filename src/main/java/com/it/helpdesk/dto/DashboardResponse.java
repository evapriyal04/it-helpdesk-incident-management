package com.it.helpdesk.dto;

import java.util.Map;

public class DashboardResponse {

    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;
    private long resolvedTickets;
    private Map<String, Long> ticketsByPriority;
    private Map<String, Long> ticketsByCategory;

    public DashboardResponse(long totalTickets, long openTickets, long inProgressTickets,
                             long resolvedTickets, Map<String, Long> ticketsByPriority,
                             Map<String, Long> ticketsByCategory) {
        this.totalTickets = totalTickets;
        this.openTickets = openTickets;
        this.inProgressTickets = inProgressTickets;
        this.resolvedTickets = resolvedTickets;
        this.ticketsByPriority = ticketsByPriority;
        this.ticketsByCategory = ticketsByCategory;
    }

    public long getTotalTickets() { return totalTickets; }
    public long getOpenTickets() { return openTickets; }
    public long getInProgressTickets() { return inProgressTickets; }
    public long getResolvedTickets() { return resolvedTickets; }
    public Map<String, Long> getTicketsByPriority() { return ticketsByPriority; }
    public Map<String, Long> getTicketsByCategory() { return ticketsByCategory; }
}