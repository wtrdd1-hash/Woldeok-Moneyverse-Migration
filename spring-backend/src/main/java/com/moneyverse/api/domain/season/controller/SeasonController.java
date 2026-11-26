package com.moneyverse.api.domain.season.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping({"/api/seasons", "/api/v1/seasons"})
public class SeasonController {

    private final SeasonService seasonService;
    private final MemberApiGuard guard;

    public SeasonController(SeasonService seasonService, MemberApiGuard guard) {
        this.seasonService = seasonService;
        this.guard = guard;
    }

    @GetMapping("/events")
    @Operation(summary = "Active season events (season_active_events)")
    public ResponseEntity<?> events() {
        return ResponseEntity.ok(java.util.Map.of("events", seasonService.activeEvents()));
    }

    @GetMapping("/current")
    @Operation(summary = "현재 진행 중인 활성 시즌 정보 조회")
    public ApiResponse<SeasonInfo> getCurrentSeason() {
        return ApiResponse.ok(seasonService.getCurrentSeason());
    }

    /**
     * QA 2026-11-25 (critical): this took the member from an X-User-Id header
     * (fixed default member) outside the session filter and added 10,000 WLD to
     * wallets directly, unlimited, outside the ledger, while claiming ledger
     * verification. The DB function season_claim_reward refuses settlement
     * (55000), so the API refuses too, after session + CSRF.
     */
    @PostMapping("/rewards/claim")
    @Operation(summary = "Season reward claim: refused until ledger settlement exists (DB: season_claim_reward)")
    public ResponseEntity<?> claimReward(HttpServletRequest request) {
        guard.verifiedMutationActor(request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(java.util.Map.of("code", "SEASON_REWARD_SETTLEMENT_UNAVAILABLE", "message", "Season reward ledger settlement is unavailable"));
    }
}
