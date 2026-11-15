package com.moneyverse.api.domain.club.controller;

import com.moneyverse.api.domain.club.dto.ClubDtos.*;
import com.moneyverse.api.domain.club.service.ClubService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Club & Cooperatives", description = "?대읇/?묐룞議고빀 紐⑸줉, ?곸꽭, 媛??諛??덊눜 API")
@RestController
@RequestMapping({"/api/club", "/api/v1/club"})
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
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

    @GetMapping({"", "/", "/list"})
    @Operation(summary = "?꾩껜 ?대읇 紐⑸줉 議고쉶")
    public ResponseEntity<ClubListResponse> listClubs(
            @RequestParam(value = "limit", defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(clubService.listClubs(limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "?뱀젙 ?대읇 ?곸꽭 ?뺣낫 議고쉶")
    public ResponseEntity<ClubDetailResponse> getClub(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(clubService.getClub(id, userId));
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "?대읇 媛???좎껌")
    public ResponseEntity<ClubActionResponse> joinClub(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(clubService.joinClub(userId, id));
    }

    @PostMapping("/{id}/leave")
    @Operation(summary = "?대읇 ?덊눜")
    public ResponseEntity<ClubActionResponse> leaveClub(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(clubService.leaveClub(userId, id));
    }
}

