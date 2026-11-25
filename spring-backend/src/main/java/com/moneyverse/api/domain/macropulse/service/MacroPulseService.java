package com.moneyverse.api.domain.macropulse.service;

import com.moneyverse.api.domain.macropulse.dto.MacroPulseDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class MacroPulseService {

    private static final Logger log = LoggerFactory.getLogger(MacroPulseService.class);
    private final JdbcTemplate jdbcTemplate;

    public MacroPulseService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public MacroPulseResponse getMacroPulse() {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "MACROPULSE_CANONICAL_SOURCE_UNAVAILABLE");
    }

    public BurnEventListResponse getBurnEvents() {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "MACROPULSE_CANONICAL_SOURCE_UNAVAILABLE");
    }

    public HotTimeStatusResponse getHotTimeStatus() {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "MACROPULSE_CANONICAL_SOURCE_UNAVAILABLE");
    }
}
