package com.moneyverse.api.domain.progression.controller;

import com.moneyverse.api.domain.progression.dto.ProgressionDtos.*;
import com.moneyverse.api.domain.progression.service.ProgressionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Progression & Credit", description = "유저 성장 단계, 신용 등급, 초반 퀘스트 진행도 API")
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
                : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            return UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20");
        }
    }

    @GetMapping({"", "/"})
    @Operation(summary = "내 성장 단계 및 해금 기능 조회")
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
    @Operation(summary = "신용 등급 및 대출 한도 조회")
    public ResponseEntity<CreditStatusResponse> creditStatus(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(progressionService.creditStatus(userId));
    }

    @GetMapping("/early-game")
    @Operation(summary = "초반 퀘스트 및 튜토리얼 진행 상태 조회")
    public ResponseEntity<EarlyGameStatusResponse> earlyGame(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(progressionService.earlyGameStatus(userId));
    }
}
