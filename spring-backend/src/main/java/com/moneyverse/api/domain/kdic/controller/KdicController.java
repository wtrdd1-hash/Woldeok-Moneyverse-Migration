package com.moneyverse.api.domain.kdic.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.kdic.dto.KdicDtos.*;
import com.moneyverse.api.domain.kdic.service.KdicService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@Tag(name = "KDIC Deposit Insurance", description = "?덇툑蹂댄뿕怨듭궗 湲곌툑 諛?湲덉쑖?덉젙 醫낇빀 愿??API")
public class KdicController {

    private final KdicService kdicService;
    private final UserAuthService userAuthService;

    public KdicController(KdicService kdicService, UserAuthService userAuthService) {
        this.kdicService = kdicService;
        this.userAuthService = userAuthService;
    }

    private String requireSuperadmin(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> session = userAuthService.resolveSession(request);
        if (session.isEmpty() || !session.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Signed-in administrator session required");
        }
        // Roles are read from the database by UserAuthService, never from headers.
        if (session.get().getRoles() == null || session.get().getRoles().stream()
                .noneMatch(role -> "superadmin".equalsIgnoreCase(role))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Superadmin role required");
        }
        return session.get().getUserId().toString();
    }

    @Operation(summary = "?덇툑蹂댄뿕怨듭궗 湲곌툑 諛?遺蹂닿툑?듦린愿 醫낇빀 ?꾪솴 議고쉶")
    @GetMapping(path = {
            "/api/admin/kdic/overview",
            "/api/v1/admin/kdic/overview"
    })
    public ApiResponse<KdicOverviewResponse> getOverview(HttpServletRequest request) {
        requireSuperadmin(request);
        return ApiResponse.ok(kdicService.getOverview());
    }

    @Operation(summary = "KDIC 蹂듭떇遺湲??먯옣 臾닿껐??諛?援?퀬 ?곌껐 ?議?議고쉶")
    @GetMapping(path = {
            "/api/admin/kdic/ledger-integrity",
            "/api/v1/admin/kdic/ledger-integrity"
    })
    public ApiResponse<KdicLedgerEvidenceDto> getLedgerIntegrity(HttpServletRequest request) {
        requireSuperadmin(request);
        return ApiResponse.ok(kdicService.getLedgerIntegrity());
    }

    @Operation(summary = "遺꾧린蹂??덈낫猷??곗텧 諛?湲곌툑 ?곷┰ 吏묓뻾")
    @PostMapping(path = {
            "/api/admin/kdic/assess-premiums",
            "/api/v1/admin/kdic/assess-premiums"
    })
    public ApiResponse<Map<String, Object>> assessPremiums(HttpServletRequest request) {
        String actor = requireSuperadmin(request);
        return ApiResponse.ok(kdicService.assessPremiums(actor), "遺꾧린蹂??덈낫猷뚭? ?뺤긽 吏뺤닔?섏뿀?듬땲??");
    }

    @Operation(summary = "遺蹂?湲덉쑖湲곌? 湲닿툒 ?좊룞?????Bailout) 吏묓뻾")
    @PostMapping(path = {
            "/api/admin/kdic/liquidity-loan",
            "/api/v1/admin/kdic/liquidity-loan"
    })
    public ApiResponse<Map<String, Object>> injectLiquidity(
            @RequestParam(defaultValue = "BANK_COMMERCIAL") String institutionId,
            @RequestParam(defaultValue = "1000000") long amountWld,
            HttpServletRequest request
    ) {
        String actor = requireSuperadmin(request);
        return ApiResponse.ok(kdicService.injectEmergencyLiquidity(institutionId, amountWld, actor), "湲닿툒 ?좊룞????ш? 吏묓뻾?섏뿀?듬땲??");
    }

    @Operation(summary = "遺??湲덉쑖湲곌? ?덇툑????꾨???吏묓뻾")
    @PostMapping(path = {
            "/api/admin/kdic/payout",
            "/api/v1/admin/kdic/payout"
    })
    public ApiResponse<Map<String, Object>> executePayout(
            @RequestParam(defaultValue = "BANK_COMMERCIAL") String institutionId,
            @RequestParam(defaultValue = "?뺣━?덉감 媛쒖떆") String reason,
            HttpServletRequest request
    ) {
        String actor = requireSuperadmin(request);
        return ApiResponse.ok(kdicService.executePayout(institutionId, reason, actor), "?덇툑????꾨??쒓? 吏묓뻾?섏뿀?듬땲??");
    }

    @Operation(summary = "?援?? 怨듦컻 ?덇툑?먮낫???ы꽭 議고쉶")
    @GetMapping(path = {
            "/api/kdic/portal", "/api/kdic/overview", "/api/v1/kdic/overview",
            "/api/v1/kdic/portal"
    })
    public ApiResponse<KdicOverviewResponse> getPublicPortalData() {
        return ApiResponse.ok(kdicService.getOverview());
    }
}

