package com.it.helpdesk.service;

import com.it.helpdesk.dto.RecommendationResponse;
import com.it.helpdesk.dto.UserResponse;
import com.it.helpdesk.entity.Category;
import com.it.helpdesk.entity.Role;
import com.it.helpdesk.entity.SupportTeam;
import com.it.helpdesk.entity.Ticket;
import com.it.helpdesk.entity.User;
import com.it.helpdesk.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AssignmentService {

    private final UserRepository userRepository;

    // The routing rules: which team handles which category
    private final Map<Category, SupportTeam> teamByCategory = new HashMap<>();

    public AssignmentService(UserRepository userRepository) {
        this.userRepository = userRepository;

        teamByCategory.put(Category.NETWORK, SupportTeam.NETWORK_SUPPORT);
        teamByCategory.put(Category.HARDWARE, SupportTeam.HARDWARE_SUPPORT);
        teamByCategory.put(Category.SOFTWARE, SupportTeam.SOFTWARE_SUPPORT);
        teamByCategory.put(Category.ACCESS, SupportTeam.ACCESS_MANAGEMENT);
    }

    public SupportTeam getRecommendedTeam(Category category) {
        return teamByCategory.get(category);
    }

    // Builds the recommendation: the team plus the agents who belong to it
    public RecommendationResponse getRecommendation(Ticket ticket) {
        SupportTeam team = getRecommendedTeam(ticket.getCategory());

        List<User> agents = userRepository.findByRoleAndSupportTeam(Role.IT_AGENT, team);

        List<UserResponse> agentResponses = new ArrayList<>();
        for (User agent : agents) {
            agentResponses.add(new UserResponse(agent.getId(), agent.getFullName(),
                    agent.getEmail(), agent.getRole(), agent.getSupportTeam()));
        }

        return new RecommendationResponse(team, team.getDisplayName(), agentResponses);
    }
}