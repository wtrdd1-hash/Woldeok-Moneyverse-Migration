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

    private ProgressionStatus getOrCreateProgression(UUID userId) {
        final UUID effectiveUserId = (userId != null) ? userId : UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20");

        String sql = "SELECT stage_code, reached_at, updated_at FROM user_progression WHERE user_id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                String stage = rs.getString("stage_code");
                int level = mapStageToLevel(stage);
                Timestamp rAt = rs.getTimestamp("reached_at");
                Timestamp uAt = rs.getTimestamp("updated_at");
                OffsetDateTime reachedAt = rAt != null ? rAt.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);
                OffsetDateTime updatedAt = uAt != null ? uAt.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);

                return new ProgressionStatus(
                    effectiveUserId,
                    stage != null ? stage : "STAGE_1_NOVICE",
                    level,
                    150L,
                    1000L,
                    reachedAt,
                    updatedAt,
                    List.of("STOCKS", "BANK", "WORK", "SUPPORT")
                );
            }, effectiveUserId);
        } catch (EmptyResultDataAccessException e) {
            try {
                jdbcTemplate.update(
                    "INSERT INTO user_progression (user_id, stage_code, reached_at, updated_at) VALUES (?, 'STAGE_1_NOVICE', NOW(), NOW()) ON CONFLICT (user_id) DO NOTHING",
                    effectiveUserId
                );
            } catch (Exception ignored) {}

            return new ProgressionStatus(
                effectiveUserId,
                "STAGE_1_NOVICE",
                1,
                0L,
                500L,
                OffsetDateTime.now(ZoneOffset.UTC),
                OffsetDateTime.now(ZoneOffset.UTC),
                List.of("STOCKS", "BANK", "WORK")
            );
        }
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
