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
        ProgressionStatus status = getOrCreateProgression(userId);
        return new ProgressionStatusResponse(true, status);
    }

    public ProgressionRefreshResponse refresh(UUID userId) {
        ProgressionStatus status = getOrCreateProgression(userId);
        return new ProgressionRefreshResponse(true, status, false);
    }

    public CreditStatusResponse creditStatus(UUID userId) {
        String grade = "A+";
        int score = 850;
        long maxLimit = 50_000_000L;
        long activeBalance = 0L;

        try {
            Long loanSum = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(remaining_principal), 0) FROM loans WHERE user_id = ? AND status = 'ACTIVE'",
                Long.class, userId
            );
            if (loanSum != null) {
                activeBalance = loanSum;
            }
        } catch (Exception ignored) {}

        return new CreditStatusResponse(true, grade, score, maxLimit, activeBalance, List.of());
    }

    public EarlyGameStatusResponse earlyGameStatus(UUID userId) {
        List<Map<String, Object>> quests = List.of(
            Map.of("id", "QUEST_1", "step", 1, "title", "로그인 및 이용 동의", "rewardWld", 10000, "isCompleted", true),
            Map.of("id", "QUEST_2", "step", 2, "title", "실전 복리 계산기 체험", "rewardWld", 5000, "isCompleted", true),
            Map.of("id", "QUEST_3", "step", 3, "title", "가상 주식 10단 호가창 조회", "rewardWld", 5000, "isCompleted", true),
            Map.of("id", "QUEST_4", "step", 4, "title", "가상 주식 모의투자 첫 체결", "rewardWld", 20000, "isCompleted", false),
            Map.of("id", "QUEST_5", "step", 5, "title", "일일 직업 파밍 루틴 수행", "rewardWld", 10000, "isCompleted", false),
            Map.of("id", "QUEST_6", "step", 6, "title", "1:1 스마트 P2P 간편 송금", "rewardWld", 15000, "isCompleted", false),
            Map.of("id", "QUEST_7", "step", 7, "title", "핀테크 금융 상식 퀴즈 정답", "rewardWld", 10000, "isCompleted", false)
        );

        return new EarlyGameStatusResponse(true, "STEP_4_TRADING", false, quests);
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
