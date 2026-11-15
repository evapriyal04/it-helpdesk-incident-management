package com.it.helpdesk.dto;

import jakarta.validation.constraints.NotNull;

public class AssignRequest {

    @NotNull(message = "Agent id is required")
    private Long agentId;

    private String reassignmentReason;

    private boolean overrideMismatch;

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public String getReassignmentReason() { return reassignmentReason; }
    public void setReassignmentReason(String reassignmentReason) { this.reassignmentReason = reassignmentReason; }

    public boolean isOverrideMismatch() { return overrideMismatch; }
    public void setOverrideMismatch(boolean overrideMismatch) { this.overrideMismatch = overrideMismatch; }
}