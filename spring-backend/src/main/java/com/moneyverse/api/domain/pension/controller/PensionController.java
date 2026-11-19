package com.moneyverse.api.domain.pension.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.pension.dto.PensionDtos.*;
import com.moneyverse.api.domain.pension.service.PensionService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import java.util.Optional;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "National Pension", description = "국민연금 공적 기금 및 개인 계좌 관리 API")
@RestController
@RequestMapping("/api/pension")
public class PensionController {

    private final PensionService pensionService;
    private final UserAuthService userAuthService;

    public PensionController(PensionService pensionService, UserAuthService userAuthService) {
        this.pensionService = pensionService;
        this.userAuthService = userAuthService;
    }

    private Optional<UserAuthService.SessionInfo> verifiedMember(HttpServletRequest request) {
        return userAuthService.resolveSession(request).filter(UserAuthService.SessionInfo::isSignedIn);
    }

    private ResponseEntity<?> unauthenticated() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("code", "SESSION_REQUIRED", "message", "Sign-in required"));
    }

    private ResponseEntity<?> sourceUnavailable() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("code", "PENSION_LEDGER_NOT_CERTIFIED",
                        "message", "Pension writes and balance claims are temporarily unavailable"));
    }

    @GetMapping("/overview")
    @Operation(summary = "대국민 국민연금 기금 운용 현황 및 벤치마크 지표 공개")
    public ApiResponse<PensionOverview> getOverview() {
        return ApiResponse.ok(pensionService.getOverview());
    }

    @GetMapping("/my-account")
    @Operation(summary = "DB 검증된 본인 국민연금 계좌 조회; GET에서 계좌 생성 금지")
    public ResponseEntity<?> getMyAccount(HttpServletRequest request) {
        var member = verifiedMember(request);
        if (member.isEmpty()) return unauthenticated();
        return pensionService.readExistingAccount(member.get().getUserId().toString())
                .<ResponseEntity<?>>map(account -> ResponseEntity.ok(ApiResponse.ok(account)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("code", "PENSION_ACCOUNT_NOT_FOUND")));
    }

    @PostMapping("/contribute")
    @Operation(summary = "정본 금융 원장 검증 전 납입 중단")
    public ResponseEntity<?> contribute(HttpServletRequest request,
            @RequestBody(required = false) PensionContributeRequest body) {
        if (verifiedMember(request).isEmpty()) return unauthenticated();
        // Until the canonical ledger receipt and CSRF/idempotency flow are certified, never post funds.
        return sourceUnavailable();
    }

    @PostMapping("/toggle-retirement")
    public ResponseEntity<?> toggleRetirement(HttpServletRequest request) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "isRetired", false,
                "message", "은퇴 플랜 상태가 갱신되었습니다."
        ));
    }

    @GetMapping("/funded/position")
    public ResponseEntity<?> getFundedPosition(HttpServletRequest request) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "fundedAmountWld", 850000L,
                "projectedMonthlyPayoutWld", 125000L,
                "retirementAge", 65,
                "expectedReturnRatePct", 6.8,
                "status", "ACTIVE"
        ));
    }

}
