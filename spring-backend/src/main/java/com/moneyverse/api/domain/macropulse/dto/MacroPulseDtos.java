package com.moneyverse.api.domain.macropulse.dto;

import java.util.List;
import java.util.Map;

public class MacroPulseDtos {

    public record MacroPulseResponse(
            boolean ok,
            double gdpGrowthRatePct,
            double baseInterestRatePct,
            double inflationRatePct,
            long m0SupplyWld,
            long totalBurnedWld,
            String economicPhase
    ) {}

    public record BurnEventItem(
            String id,
            String title,
            String reason,
            long amountWld,
            String executedAt
    ) {}

    public record BurnEventListResponse(
            boolean ok,
            List<BurnEventItem> events
    ) {}

    public record HotTimeStatusResponse(
            boolean ok,
            boolean isHotTimeActive,
            double expMultiplier,
            double rewardMultiplier,
            String endsAt
    ) {}
}
