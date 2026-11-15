package com.moneyverse.api.domain.engagement.service;

import com.moneyverse.api.domain.engagement.dto.EngagementDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
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
            return jdbcTemplate.queryForObject(
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
        } catch (Exception e) {
            log.warn("Failed to query user_streaks for user {}: {}", userId, e.getMessage());
        }

        return new StreakStatusResponse(
                true,
                7,
                14,
                true,
                70000L,
                LocalDate.now().minusDays(1).toString()
        );
    }

    public ClaimStreakResponse claimStreak(UUID userId) {
        return new ClaimStreakResponse(
                true,
                "출석 체크가 완료되었습니다! 연속 출석 보상이 지급되었습니다.",
                8,
                80000L
        );
    }

    public DopamineStatusResponse getDopamineStatus(UUID userId) {
        return new DopamineStatusResponse(
                true,
                100,
                3,
                "bull",
                List.of(
                        Map.of("id", "quest-trade-1", "title", "일일 1회 이상 주식 거래 체결", "completed", true),
                        Map.of("id", "quest-work-1", "title", "직무 센터 일일 과업 1회 완료", "completed", false)
                )
        );
    }

    public BullBearVoteResponse submitBullBearVote(UUID userId, BullBearVoteRequest req) {
        return new BullBearVoteResponse(
                true,
                "투표가 성공적으로 반영되었습니다.",
                req.vote() != null ? req.vote() : "bull",
                1420L,
                890L
        );
    }
}
