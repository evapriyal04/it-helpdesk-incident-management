package com.it.helpdesk.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.it.helpdesk.entity.Ticket;
import com.it.helpdesk.entity.TicketStatus;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Ticket findByTicketNumber(String ticketNumber);

    long countByStatus(TicketStatus status);

    @Query("SELECT t.priority, COUNT(t) FROM Ticket t GROUP BY t.priority")
    List<Object[]> countTicketsByPriority();

    @Query("SELECT t.category, COUNT(t) FROM Ticket t GROUP BY t.category")
    List<Object[]> countTicketsByCategory();
}