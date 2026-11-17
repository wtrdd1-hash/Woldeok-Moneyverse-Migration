package com.moneyverse.api.domain.engagement.controller;

import com.moneyverse.api.domain.engagement.dto.EngagementDtos.*;
import com.moneyverse.api.domain.engagement.service.EngagementService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Tag(name = "Engagement & Dopamine", description = "연속 출석 체크, 일일 퀘스트 및 도파민 상호작용 API")
@RestController
@RequestMapping({"/api/engagement", "/api/v1/engagement", "/api/dopamine", "/api/v1/dopamine"})
public class EngagementController {

    private final EngagementService engagementService;
    private final UserAuthService userAuthService;

    public EngagementController(EngagementService engagementService, UserAuthService userAuthService) {
        this.engagementService = engagementService;
        this.userAuthService = userAuthService;
    }

    private UUID requireActor(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> session = userAuthService.resolveSession(request);
        if (session.isEmpty() || !session.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Signed-in session required");
        }
        // Never derive member authority from caller-supplied X-User-Id headers.
        return session.get().getUserId();
    }

    @GetMapping({"", "/", "/status", "/streak"})
    @Operation(summary = "연속 출석 체크 및 스트릭 현황 조회")
    public ResponseEntity<StreakStatusResponse> getStreakStatus(HttpServletRequest request) {
        return ResponseEntity.ok(engagementService.getStreakStatus(requireActor(request)));
    }

    @PostMapping({"/claim-streak", "/streak/claim"})
    @Operation(summary = "일일 출석 보상 수령")
    public ResponseEntity<ClaimStreakResponse> claimStreak(HttpServletRequest request) {
        return ResponseEntity.ok(engagementService.claimStreak(requireActor(request)));
    }

    // /engagement/dopamine/status belongs exclusively to the session-protected
    // DopamineController. This legacy alias does not claim a verified receipt.
    @GetMapping("/features")
    @Operation(summary = "도파민 미니게임 및 일일 퀘스트 상태 조회")
    public ResponseEntity<DopamineStatusResponse> getDopamineStatus(HttpServletRequest request) {
        return ResponseEntity.ok(engagementService.getDopamineStatus(requireActor(request)));
    }

    @PostMapping({"/bull-bear", "/dopamine/bull-bear"})
    @Operation(summary = "상승/하락 심리 투표 집행")
    public ResponseEntity<BullBearVoteResponse> submitVote(
            @RequestBody BullBearVoteRequest req,
            HttpServletRequest request) {
        return ResponseEntity.ok(engagementService.submitBullBearVote(requireActor(request), req));
    }
}
