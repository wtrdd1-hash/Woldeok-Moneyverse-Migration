package com.moneyverse.api.domain.engagement.dto;

import java.util.List;
import java.util.Map;

public class EngagementDtos {

    public record StreakStatusResponse(
            boolean ok,
            int currentStreak,
            int maxStreak,
            boolean canClaimToday,
            long nextRewardWld,
            String lastCheckinDate
    ) {}

    public record ClaimStreakResponse(
            boolean ok,
            String message,
            int updatedStreak,
            long rewardWld
    ) {}

    public record DopamineStatusResponse(
            boolean ok,
            int duckTapsRemaining,
            int starDropsAvailable,
            String bullBearStance,
            List<Map<String, Object>> activeQuests
    ) {}

    public record BullBearVoteRequest(
            String vote,
            String stockSymbol
    ) {}

    public record BullBearVoteResponse(
            boolean ok,
            String message,
            String votedStance,
            long totalBullVotes,
            long totalBearVotes
    ) {}
}
