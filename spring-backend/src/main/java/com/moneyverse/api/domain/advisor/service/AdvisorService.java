package com.moneyverse.api.domain.advisor.service;

import com.moneyverse.api.domain.advisor.dto.AdvisorDtos.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AdvisorService {

    private final JdbcTemplate jdbcTemplate;

    public AdvisorService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public DiagnosisResponse diagnoseUserPortfolio(UUID userId) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "ADVISOR_CANONICAL_SOURCE_UNAVAILABLE");
    }

    public AskDeokiResponse askDeoki(UUID userId, AskDeokiRequest req) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "ADVISOR_CANONICAL_SOURCE_UNAVAILABLE");
    }
}
