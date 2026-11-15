package com.it.helpdesk.entity;

public enum SupportTeam {

    NETWORK_SUPPORT("Network Support"),
    HARDWARE_SUPPORT("Hardware Support"),
    SOFTWARE_SUPPORT("Software Support"),
    ACCESS_MANAGEMENT("Access Management");

    private final String displayName;

    SupportTeam(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}