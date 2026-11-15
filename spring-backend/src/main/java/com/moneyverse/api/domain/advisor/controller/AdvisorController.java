package com.moneyverse.api.domain.advisor.controller;

import com.moneyverse.api.domain.advisor.dto.AdvisorDtos.*;
import com.moneyverse.api.domain.advisor.service.AdvisorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "AI Financial Advisor", description = "AI 금융 비서 덕이 포트폴리오 진단 및 투자 질의응답 API")
@RestController
@RequestMapping({"/api/advisor/deoki", "/api/v1/advisor/deoki", "/api/advisor", "/api/v1/advisor"})
public class AdvisorController {

    private final AdvisorService advisorService;

    public AdvisorController(AdvisorService advisorService) {
        this.advisorService = advisorService;
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

    @GetMapping({"", "/", "/diagnose"})
    @Operation(summary = "포트폴리오 실시간 건전성 진단 리포트 조회")
    public ResponseEntity<DiagnosisResponse> getDiagnosis(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(advisorService.diagnoseUserPortfolio(userId));
    }

    @PostMapping("/ask")
    @Operation(summary = "AI 금융 비서 덕이 질의응답")
    public ResponseEntity<AskDeokiResponse> askDeoki(
            @RequestBody AskDeokiRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(advisorService.askDeoki(userId, req));
    }
}
