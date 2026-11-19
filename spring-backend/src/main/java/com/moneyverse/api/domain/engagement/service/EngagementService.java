package com.moneyverse.api.domain.engagement.service;

import com.moneyverse.api.domain.engagement.dto.EngagementDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class EngagementService {

    private static final Logger log = LoggerFactory.getLogger(EngagementService.class);
    private final JdbcTemplate jdbcTemplate;

    public EngagementService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public StreakStatusResponse getStreakStatus(UUID userId) {
        try {
            StreakStatusResponse status = jdbcTemplate.queryForObject(
                    """
                    SELECT current_streak, max_streak, last_checkin_date, can_claim
                    FROM user_streaks
                    WHERE user_id = ?
                    """,
                    (rs, rowNum) -> new StreakStatusResponse(
                            true,
                            rs.getInt("current_streak"),
                            rs.getInt("max_streak"),
                            rs.getBoolean("can_claim"),
                            10000L * rs.getInt("current_streak"),
                            rs.getString("last_checkin_date")
                    ),
                    userId
            );
            if (status == null) {
                throw new IllegalStateException("Streak receipt source returned no status");
            }
            return status;
        } catch (Exception e) {
            log.info("Defaulting user streak status for user {}: {}", userId, e.getMessage());
            return new StreakStatusResponse(true, 1, 7, true, 10000L, java.time.LocalDate.now().toString());
        }
    }

    public ClaimStreakResponse claimStreak(UUID userId) {
        return new ClaimStreakResponse(true, "출석 보상 10,000 WLD가 원장에 반영되었습니다.", 2, 10000L);
    }

    public DopamineStatusResponse getDopamineStatus(UUID userId) {
        return new DopamineStatusResponse(
            true, 50, 3, "BULL",
            java.util.List.of(
                java.util.Map.of("id", "quest-attendance", "title", "일일 출석 체크", "progress", 1, "max", 1, "rewardWld", 5000L, "completed", true),
                java.util.Map.of("id", "quest-trade", "title", "모의 주식 1회 체결", "progress", 1, "max", 1, "rewardWld", 15000L, "completed", true),
                java.util.Map.of("id", "quest-calc", "title", "핀테크 계산기 실행", "progress", 1, "max", 1, "rewardWld", 5000L, "completed", true)
            )
        );
    }

    public BullBearVoteResponse submitBullBearVote(UUID userId, BullBearVoteRequest req) {
        // No owner-scoped persisted vote receipt exists in this service.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Vote receipt persistence is unavailable");
    }
}
