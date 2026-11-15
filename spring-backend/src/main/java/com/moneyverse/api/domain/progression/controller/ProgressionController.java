package com.moneyverse.api.domain.progression.controller;

import com.moneyverse.api.domain.progression.dto.ProgressionDtos.*;
import com.moneyverse.api.domain.progression.service.ProgressionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Progression & Credit", description = "?좎? ?깆옣 ?④퀎, ?좎슜 ?깃툒, 珥덈컲 ?섏뒪??吏꾪뻾??API")
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

    @GetMapping({"", "/", "/status"})
    @Operation(summary = "???깆옣 ?④퀎 諛??닿툑 湲곕뒫 議고쉶")
    public ResponseEntity<ProgressionStatusResponse> status(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(progressionService.status(userId));
    }

    @PostMapping("/refreshes")
    @Operation(summary = "?깆옣 ?④퀎 媛깆떊 ?ш퀎??)
    public ResponseEntity<ProgressionRefreshResponse> refresh(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(progressionService.refresh(userId));
    }

    @GetMapping("/credits")
    @Operation(summary = "?좎슜 ?깃툒 諛??異??쒕룄 議고쉶")
    public ResponseEntity<CreditStatusResponse> creditStatus(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(progressionService.creditStatus(userId));
    }

    @GetMapping("/early-game")
    @Operation(summary = "珥덈컲 ?섏뒪??諛??쒗넗由ъ뼹 吏꾪뻾 ?곹깭 議고쉶")
    public ResponseEntity<EarlyGameStatusResponse> earlyGame(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(progressionService.earlyGameStatus(userId));
    }
}

