package com.it.helpdesk.dto;

import com.it.helpdesk.entity.Role;
import com.it.helpdesk.entity.SupportTeam;

public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private SupportTeam supportTeam;

    public UserResponse(Long id, String fullName, String email, Role role, SupportTeam supportTeam) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.supportTeam = supportTeam;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
    public SupportTeam getSupportTeam() { return supportTeam; }
}