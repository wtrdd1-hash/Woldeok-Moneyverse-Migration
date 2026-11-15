package com.moneyverse.api.domain.advisor.dto;

import java.util.List;
import java.util.Map;

public class AdvisorDtos {

    public record DiagnosisResponse(
            boolean ok,
            int healthScore,
            String riskTier,
            String summary,
            List<String> recommendations,
            Map<String, Object> portfolioBreakdown
    ) {}

    public record AskDeokiRequest(
            String question
    ) {}

    public record AskDeokiResponse(
            boolean ok,
            String answer,
            List<String> suggestedFollowups
    ) {}
}
