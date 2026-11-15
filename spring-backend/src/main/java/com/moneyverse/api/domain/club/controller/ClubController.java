package com.moneyverse.api.domain.club.controller;

import com.moneyverse.api.domain.club.dto.ClubDtos.*;
import com.moneyverse.api.domain.club.service.ClubService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Club & Cooperatives", description = "클럽/협동조합 목록, 상세, 가입 및 탈퇴 API")
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

    @GetMapping("/list")
    @Operation(summary = "전체 클럽 목록 조회")
    public ResponseEntity<ClubListResponse> listClubs(
            @RequestParam(value = "limit", defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(clubService.listClubs(limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "특정 클럽 상세 정보 조회")
    public ResponseEntity<ClubDetailResponse> getClub(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(clubService.getClub(id, userId));
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "클럽 가입 신청")
    public ResponseEntity<ClubActionResponse> joinClub(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(clubService.joinClub(userId, id));
    }

    @PostMapping("/{id}/leave")
    @Operation(summary = "클럽 탈퇴")
    public ResponseEntity<ClubActionResponse> leaveClub(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(clubService.leaveClub(userId, id));
    }
}
