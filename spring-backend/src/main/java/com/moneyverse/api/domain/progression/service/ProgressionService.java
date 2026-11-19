package com.moneyverse.api.domain.progression.service;

import com.moneyverse.api.domain.progression.dto.ProgressionDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ProgressionService {

    private static final Logger log = LoggerFactory.getLogger(ProgressionService.class);
    private final JdbcTemplate jdbcTemplate;

    public ProgressionService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ProgressionStatusResponse status(UUID userId) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Verified progression source unavailable");
    }

    public ProgressionRefreshResponse refresh(UUID userId) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Progression refresh receipt unavailable");
    }

    public CreditStatusResponse creditStatus(UUID userId) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Verified credit rating source unavailable");
    }

    public EarlyGameStatusResponse earlyGameStatus(UUID userId) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Verified onboarding quest source unavailable");
    }

    private int mapStageToLevel(String stage) {
        if (stage == null) return 1;
        return switch (stage) {
            case "STAGE_2_APPRENTICE" -> 2;
            case "STAGE_3_JOURNEYMAN" -> 3;
            case "STAGE_4_EXPERT" -> 4;
            case "STAGE_5_MASTER" -> 5;
            case "STAGE_6_TYCOON" -> 6;
            default -> 1;
        };
    }
}
