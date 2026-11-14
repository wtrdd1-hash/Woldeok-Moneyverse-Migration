package com.moneyverse.api.domain.pension.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.pension.dto.PensionDtos.*;
import com.moneyverse.api.domain.pension.service.PensionService;
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

    public PensionController(PensionService pensionService) {
        this.pensionService = pensionService;
    }

    @GetMapping("/overview")
    @Operation(summary = "대국민 국민연금 기금 운용 현황 및 벤치마크 지표 공개")
    public ApiResponse<PensionOverview> getOverview() {
        return ApiResponse.ok(pensionService.getOverview());
    }

    @GetMapping("/my-account")
    @Operation(summary = "내 국민연금 계좌, 적립금, 등급, 은퇴 수령 상태 조회")
    public ApiResponse<PensionAccountInfo> getMyAccount(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId) {
        return ApiResponse.ok(pensionService.getOrCreateAccount(userId));
    }

    @PostMapping("/contribute")
    @Operation(summary = "국민연금 기여금 납입 (지갑 차감 -> 국고 편입)")
    public ApiResponse<Map<String, Object>> contribute(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody PensionContributeRequest request) {
        Map<String, Object> result = pensionService.contribute(userId, request.getAmountWld(), request.getNote());
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @PostMapping("/toggle-retirement")
    @Operation(summary = "은퇴 상태 전환 토글")
    public ApiResponse<Map<String, Object>> toggleRetirement(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId) {
        Map<String, Object> result = pensionService.toggleRetirement(userId);
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @GetMapping("/funded/position")
    @Operation(summary = "정식 원장으로 증명된 신규 국민연금 에스크로 적립금 조회")
    public ApiResponse<FundedPositionResponse> getFundedPosition(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId) {
        return ApiResponse.ok(pensionService.getFundedPosition(userId));
    }
}
