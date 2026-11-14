package com.moneyverse.api.domain.season.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.season.dto.SeasonDtos.*;
import com.moneyverse.api.domain.season.service.SeasonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Season", description = "시즌 랭킹 및 시즌 티어 보상 수령 API")
@RestController
@RequestMapping("/api/seasons")
public class SeasonController {

    private final SeasonService seasonService;

    public SeasonController(SeasonService seasonService) {
        this.seasonService = seasonService;
    }

    @GetMapping("/current")
    @Operation(summary = "현재 진행 중인 활성 시즌 정보 조회")
    public ApiResponse<SeasonInfo> getCurrentSeason() {
        return ApiResponse.ok(seasonService.getCurrentSeason());
    }

    @PostMapping("/rewards/claim")
    @Operation(summary = "시즌 랭크 티어 달성 보상 수령 (복식부기 원장 직결)")
    public ApiResponse<Map<String, Object>> claimReward(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody ClaimRewardRequest request) {
        Map<String, Object> result = seasonService.claimReward(userId, request.getSeasonId());
        return ApiResponse.ok(result, (String) result.get("message"));
    }
}
