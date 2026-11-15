package com.it.helpdesk.service;

import com.it.helpdesk.dto.DashboardResponse;
import com.it.helpdesk.entity.Category;
import com.it.helpdesk.entity.Priority;
import com.it.helpdesk.entity.TicketStatus;
import com.it.helpdesk.repository.TicketRepository;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final TicketRepository ticketRepository;

    public DashboardService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public DashboardResponse getDashboard() {
        long total = ticketRepository.count();
        long open = ticketRepository.countByStatus(TicketStatus.OPEN);
        long inProgress = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
        long resolved = ticketRepository.countByStatus(TicketStatus.RESOLVED);

        // Start every priority at 0 so missing groups still appear in the result
        Map<String, Long> byPriority = new HashMap<>();
        for (Priority priority : Priority.values()) {
            byPriority.put(priority.name(), 0L);
        }
        List<Object[]> priorityRows = ticketRepository.countTicketsByPriority();
        for (Object[] row : priorityRows) {
            Priority priority = (Priority) row[0];
            Long count = (Long) row[1];
            byPriority.put(priority.name(), count);
        }

        Map<String, Long> byCategory = new HashMap<>();
        for (Category category : Category.values()) {
            byCategory.put(category.name(), 0L);
        }
        List<Object[]> categoryRows = ticketRepository.countTicketsByCategory();
        for (Object[] row : categoryRows) {
            Category category = (Category) row[0];
            Long count = (Long) row[1];
            byCategory.put(category.name(), count);
        }

        return new DashboardResponse(total, open, inProgress, resolved, byPriority, byCategory);
    }
}