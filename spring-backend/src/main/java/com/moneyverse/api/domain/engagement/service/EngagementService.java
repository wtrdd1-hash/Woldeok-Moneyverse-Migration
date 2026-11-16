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
            log.warn("Failed to query verified user streak status: {}", e.getClass().getSimpleName());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Verified streak status unavailable");
        }
    }

    public ClaimStreakResponse claimStreak(UUID userId) {
        // No idempotent, ledger-backed reward writer is implemented in Spring.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Streak reward requires canonical PostgreSQL settlement");
    }

    public DopamineStatusResponse getDopamineStatus(UUID userId) {
        // Do not invent owner-specific progress, quests or spin availability.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Verified engagement feature status unavailable");
    }

    public BullBearVoteResponse submitBullBearVote(UUID userId, BullBearVoteRequest req) {
        // No owner-scoped persisted vote receipt exists in this service.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Vote receipt persistence is unavailable");
    }
}
