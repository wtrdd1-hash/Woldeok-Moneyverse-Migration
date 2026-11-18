package com.moneyverse.api.domain.advisor.service;

import com.moneyverse.api.domain.advisor.dto.AdvisorDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AdvisorService {

    private static final Logger log = LoggerFactory.getLogger(AdvisorService.class);
    private final JdbcTemplate jdbcTemplate;

    public AdvisorService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public DiagnosisResponse diagnoseUserPortfolio(UUID userId) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Verified portfolio risk source unavailable");
    }

    public AskDeokiResponse askDeoki(UUID userId, AskDeokiRequest req) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Verified advisor model and evidence unavailable");
    }
}
