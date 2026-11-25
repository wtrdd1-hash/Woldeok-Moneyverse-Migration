package com.moneyverse.api.domain.progression.controller;

import com.moneyverse.api.domain.progression.dto.ProgressionDtos.*;
import com.moneyverse.api.domain.progression.service.ProgressionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Progression & Achievements", description = "유저 성장 단계, 업적, 크레딧 및 초심자 가이드 API")
@RestController
@RequestMapping({"/api/progression", "/api/v1/progression"})
public class ProgressionController {

    private final ProgressionService progressionService;

    public ProgressionController(ProgressionService progressionService) {
        this.progressionService = progressionService;
    }

    private UUID resolveUserUuid(String xUserId, String xActorUserId) {
        String raw = (xUserId != null && !xUserId.isBlank()) ? xUserId.trim()
                : (xActorUserId != null && !xActorUserId.isBlank()) ? xActorUserId.trim()
                : null;
        // No fixed fallback member (security review 2026-11-25): the session filter supplies the actor.
        if (raw == null) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED");
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED");
        }
    }

    @GetMapping({"", "/", "/status"})
    @Operation(summary = "유저 성장 단계 및 업적 요약 조회")
    public ResponseEntity<ProgressionStatusResponse> status(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(progressionService.status(userId));
    }

    @PostMapping("/refreshes")
    @Operation(summary = "성장 단계 갱신 재계산")
    public ResponseEntity<ProgressionRefreshResponse> refresh(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(progressionService.refresh(userId));
    }

    @GetMapping("/credits")
    @Operation(summary = "시스템 크레딧 및 신용 등급 상태 조회")
    public ResponseEntity<CreditStatusResponse> credits(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(progressionService.creditStatus(userId));
    }

    @GetMapping("/early-game")
    @Operation(summary = "초심자 온보딩 가이드 및 퀘스트 상태 조회")
    public ResponseEntity<EarlyGameStatusResponse> earlyGame(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(progressionService.earlyGameStatus(userId));
    }
}
