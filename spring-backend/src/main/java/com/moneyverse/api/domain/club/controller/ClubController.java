package com.moneyverse.api.domain.club.controller;

import com.moneyverse.api.domain.club.dto.ClubDtos.*;
import com.moneyverse.api.domain.club.service.ClubService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@Tag(name = "Club & Cooperatives", description = "Source-backed public discovery; owner-scoped actions")
@RestController
@RequestMapping({"/api/club", "/api/v1/club"})
public class ClubController {
    private final ClubService clubService;
    private final MemberApiGuard memberApiGuard;

    public ClubController(ClubService clubService, MemberApiGuard memberApiGuard) {
        this.clubService = clubService;
        this.memberApiGuard = memberApiGuard;
    }

    @GetMapping({"", "/", "/list"})
    @Operation(summary = "Public club list")
    public ResponseEntity<ClubListResponse> listClubs(@RequestParam(value = "limit", defaultValue = "50") int limit) {
        return ResponseEntity.ok(clubService.listClubs(limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Public club details; 404 for absent clubs")
    public ResponseEntity<ClubDetailResponse> getClub(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(clubService.getClub(id, null));
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Verified member club membership operation")
    public ResponseEntity<ClubActionResponse> joinClub(HttpServletRequest request, @PathVariable("id") UUID id) {
        return ResponseEntity.ok(clubService.joinClub(memberApiGuard.verifiedMutationActor(request), id));
    }

    @PostMapping("/{id}/leave")
    @Operation(summary = "Verified member club membership operation")
    public ResponseEntity<ClubActionResponse> leaveClub(HttpServletRequest request, @PathVariable("id") UUID id) {
        return ResponseEntity.ok(clubService.leaveClub(memberApiGuard.verifiedMutationActor(request), id));
    }
}
