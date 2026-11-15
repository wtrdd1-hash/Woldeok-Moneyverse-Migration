package com.moneyverse.api.domain.progression.service;

import com.moneyverse.api.domain.progression.dto.ProgressionDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

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
        try {
            String sql = "SELECT stage_code, reached_at, updated_at FROM user_progression WHERE user_id = ?";
            List<ProgressionStatus> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
                String stage = rs.getString("stage_code");
                Timestamp reachedAtTs = rs.getTimestamp("reached_at");
                OffsetDateTime reachedAt = reachedAtTs != null ? reachedAtTs.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);
                Timestamp updatedAtTs = rs.getTimestamp("updated_at");
                OffsetDateTime updatedAt = updatedAtTs != null ? updatedAtTs.toInstant().atOffset(ZoneOffset.UTC) : reachedAt;

                int level = mapStageToLevel(stage);
                return new ProgressionStatus(
                        userId,
                        stage != null ? stage : "STAGE_1_NOVICE",
                        level,
                        1500L,
                        5000L,
                        reachedAt,
                        updatedAt,
                        List.of("WORK", "SHOP", "MARKET", "BANK")
                );
            }, userId);

            if (!list.isEmpty()) {
                return new ProgressionStatusResponse(true, list.get(0));
            }

            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            ProgressionStatus fallback = new ProgressionStatus(
                    userId,
                    "STAGE_1_NOVICE",
                    1,
                    0L,
                    1000L,
                    now,
                    now,
                    List.of("WORK", "SHOP", "MARKET")
            );
            return new ProgressionStatusResponse(true, fallback);
        } catch (Exception ex) {
            log.warn("Failed to query user_progression for user {}: {}", userId, ex.getMessage());
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            ProgressionStatus fallback = new ProgressionStatus(
                    userId,
                    "STAGE_1_NOVICE",
                    1,
                    0L,
                    1000L,
                    now,
                    now,
                    List.of("WORK", "SHOP", "MARKET")
            );
            return new ProgressionStatusResponse(true, fallback);
        }
    }

    public ProgressionRefreshResponse refresh(UUID userId) {
        ProgressionStatusResponse curr = status(userId);
        return new ProgressionRefreshResponse(true, curr.progression(), false);
    }

    public CreditStatusResponse creditStatus(UUID userId) {
        return new CreditStatusResponse(
                true,
                "A",
                820,
                50_000_000L,
                0L,
                List.of()
        );
    }

    public EarlyGameStatusResponse earlyGameStatus(UUID userId) {
        return new EarlyGameStatusResponse(
                true,
                "COMPLETED",
                true,
                List.of(
                        Map.of("questId", "FIRST_WORK", "title", "첫 아르바이트 완료", "status", "CLAIMED"),
                        Map.of("questId", "FIRST_STOCK", "title", "첫 주식 매수", "status", "CLAIMED"),
                        Map.of("questId", "FIRST_DEPOSIT", "title", "첫 정기예금 가입", "status", "CLAIMED")
                )
        );
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
