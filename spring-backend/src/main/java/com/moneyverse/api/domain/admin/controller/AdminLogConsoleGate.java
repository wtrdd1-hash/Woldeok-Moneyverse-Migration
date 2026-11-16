package com.moneyverse.api.domain.admin.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

/** Reuses the established session-bound database gate rather than trusting an HTTP header. */
@Component
public class AdminLogConsoleGate {
    private final JdbcTemplate jdbc;

    public AdminLogConsoleGate(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean isOpen(UUID sessionId, UUID actor) {
        if (sessionId == null || actor == null) return false;
        try {
            return "open".equals(jdbc.queryForObject(
                    "SELECT state FROM public.admin_session_touch(?, ?)",
                    String.class, sessionId, actor));
        } catch (Exception ignored) {
            // Permission failures, DB outages and invalid/expired sessions all fail closed.
            return false;
        }
    }
}
