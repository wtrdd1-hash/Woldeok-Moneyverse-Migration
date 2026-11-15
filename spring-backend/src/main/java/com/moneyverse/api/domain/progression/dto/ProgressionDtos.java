package com.moneyverse.api.domain.progression.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class ProgressionDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ProgressionStatus(
            UUID userId,
            String stageCode,
            int level,
            long currentExp,
            long nextLevelExp,
            OffsetDateTime reachedAt,
            OffsetDateTime updatedAt,
            List<String> unlockedFeatures
    ) {}

    public record ProgressionStatusResponse(
            boolean ok,
            ProgressionStatus progression
    ) {}

    public record ProgressionRefreshResponse(
            boolean ok,
            ProgressionStatus progression,
            boolean stageUpgraded
    ) {}

    public record CreditStatusResponse(
            boolean ok,
            String creditGrade,
            int creditScore,
            long maxLoanLimit,
            long activeLoanBalance,
            List<Map<String, Object>> loans
    ) {}

    public record EarlyGameStatusResponse(
            boolean ok,
            String tutorialStep,
            boolean isCompleted,
            List<Map<String, Object>> beginnerQuests
    ) {}
}
