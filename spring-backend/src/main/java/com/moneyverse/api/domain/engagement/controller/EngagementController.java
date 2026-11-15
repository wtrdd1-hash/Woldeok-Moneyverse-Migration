package com.moneyverse.api.domain.engagement.controller;

import com.moneyverse.api.domain.engagement.dto.EngagementDtos.*;
import com.moneyverse.api.domain.engagement.service.EngagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Engagement & Dopamine", description = "연속 출석 체크, 일일 퀘스트 및 도파민 상호작용 API")
@RestController
@RequestMapping({"/api/engagement", "/api/v1/engagement", "/api/dopamine", "/api/v1/dopamine"})
public class EngagementController {

    private final EngagementService engagementService;

    public EngagementController(EngagementService engagementService) {
        this.engagementService = engagementService;
    }

    private UUID resolveUserUuid(String xUserId, String xActorUserId) {
        String raw = (xUserId != null && !xUserId.isBlank()) ? xUserId.trim()
                : (xActorUserId != null && !xActorUserId.isBlank()) ? xActorUserId.trim()
                : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            return UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20");
        }
    }

    @GetMapping({"", "/", "/status", "/streak"})
    @Operation(summary = "연속 출석 체크 및 스트릭 현황 조회")
    public ResponseEntity<StreakStatusResponse> getStreakStatus(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(engagementService.getStreakStatus(userId));
    }

    @PostMapping({"/claim-streak", "/streak/claim"})
    @Operation(summary = "일일 출석 보상 수령")
    public ResponseEntity<ClaimStreakResponse> claimStreak(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(engagementService.claimStreak(userId));
    }

    @GetMapping({"/dopamine/status", "/features"})
    @Operation(summary = "도파민 미니게임 및 일일 퀘스트 상태 조회")
    public ResponseEntity<DopamineStatusResponse> getDopamineStatus(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(engagementService.getDopamineStatus(userId));
    }

    @PostMapping({"/bull-bear", "/dopamine/bull-bear"})
    @Operation(summary = "상승/하락 심리 투표 집행")
    public ResponseEntity<BullBearVoteResponse> submitVote(
            @RequestBody BullBearVoteRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(engagementService.submitBullBearVote(userId, req));
    }
}
