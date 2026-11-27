package com.moneyverse.api.domain.progression.service;

import com.moneyverse.api.domain.progression.dto.ProgressionDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@Service
public class ProgressionService {

    private static final Logger log = LoggerFactory.getLogger(ProgressionService.class);
    private final JdbcTemplate jdbcTemplate;

    public ProgressionService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ProgressionStatusResponse status(UUID userId) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "PROGRESSION_CANONICAL_SOURCE_UNAVAILABLE");
    }

    public ProgressionRefreshResponse refresh(UUID userId) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "PROGRESSION_CANONICAL_SOURCE_UNAVAILABLE");
    }

    public CreditStatusResponse creditStatus(UUID userId) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "PROGRESSION_CANONICAL_SOURCE_UNAVAILABLE");
    }

    public EarlyGameStatusResponse earlyGameStatus(UUID userId) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "PROGRESSION_CANONICAL_SOURCE_UNAVAILABLE");
    }
}
