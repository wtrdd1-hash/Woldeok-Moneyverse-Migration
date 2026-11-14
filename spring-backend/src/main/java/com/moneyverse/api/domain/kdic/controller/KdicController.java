package com.moneyverse.api.domain.kdic.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.kdic.dto.KdicDtos.*;
import com.moneyverse.api.domain.kdic.service.KdicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@Tag(name = "KDIC Deposit Insurance", description = "예금보험공사 기금 및 금융안정 종합 관제 API")
public class KdicController {

    private final KdicService kdicService;

    public KdicController(KdicService kdicService) {
        this.kdicService = kdicService;
    }

    @Operation(summary = "예금보험공사 기금 및 부보금융기관 종합 현황 조회")
    @GetMapping(path = {
            "/api/admin/kdic/overview",
            "/api/v1/admin/kdic/overview"
    })
    public ApiResponse<KdicOverviewResponse> getOverview() {
        return ApiResponse.ok(kdicService.getOverview());
    }

    @Operation(summary = "KDIC 복식부기 원장 무결성 및 국고 연결 대조 조회")
    @GetMapping(path = {
            "/api/admin/kdic/ledger-integrity",
            "/api/v1/admin/kdic/ledger-integrity"
    })
    public ApiResponse<KdicLedgerEvidenceDto> getLedgerIntegrity() {
        return ApiResponse.ok(kdicService.getLedgerIntegrity());
    }

    @Operation(summary = "분기별 예보료 산출 및 기금 적립 집행")
    @PostMapping(path = {
            "/api/admin/kdic/assess-premiums",
            "/api/v1/admin/kdic/assess-premiums"
    })
    public ApiResponse<Map<String, Object>> assessPremiums(
            @RequestHeader(value = "x-user-id", defaultValue = "admin") String actor
    ) {
        return ApiResponse.ok(kdicService.assessPremiums(actor), "분기별 예보료가 정상 징수되었습니다.");
    }

    @Operation(summary = "부보 금융기관 긴급 유동성 대여(Bailout) 집행")
    @PostMapping(path = {
            "/api/admin/kdic/liquidity-loan",
            "/api/v1/admin/kdic/liquidity-loan"
    })
    public ApiResponse<Map<String, Object>> injectLiquidity(
            @RequestParam(defaultValue = "BANK_COMMERCIAL") String institutionId,
            @RequestParam(defaultValue = "1000000") long amountWld,
            @RequestHeader(value = "x-user-id", defaultValue = "admin") String actor
    ) {
        return ApiResponse.ok(kdicService.injectEmergencyLiquidity(institutionId, amountWld, actor), "긴급 유동성 대여가 집행되었습니다.");
    }

    @Operation(summary = "부실 금융기관 예금자 대위변제 집행")
    @PostMapping(path = {
            "/api/admin/kdic/payout",
            "/api/v1/admin/kdic/payout"
    })
    public ApiResponse<Map<String, Object>> executePayout(
            @RequestParam(defaultValue = "BANK_COMMERCIAL") String institutionId,
            @RequestParam(defaultValue = "정리절차 개시") String reason,
            @RequestHeader(value = "x-user-id", defaultValue = "admin") String actor
    ) {
        return ApiResponse.ok(kdicService.executePayout(institutionId, reason, actor), "예금자 대위변제가 집행되었습니다.");
    }

    @Operation(summary = "대국민 공개 예금자보호 포털 조회")
    @GetMapping(path = {
            "/api/kdic/portal",
            "/api/v1/kdic/portal"
    })
    public ApiResponse<KdicOverviewResponse> getPublicPortalData() {
        return ApiResponse.ok(kdicService.getOverview());
    }
}
