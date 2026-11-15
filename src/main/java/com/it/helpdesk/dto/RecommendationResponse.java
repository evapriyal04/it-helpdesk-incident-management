package com.it.helpdesk.dto;

import com.it.helpdesk.entity.SupportTeam;
import java.util.List;

public class RecommendationResponse {

    private SupportTeam team;
    private String teamName;
    private List<UserResponse> agents;

    public RecommendationResponse(SupportTeam team, String teamName, List<UserResponse> agents) {
        this.team = team;
        this.teamName = teamName;
        this.agents = agents;
    }

    public SupportTeam getTeam() { return team; }
    public String getTeamName() { return teamName; }
    public List<UserResponse> getAgents() { return agents; }
}