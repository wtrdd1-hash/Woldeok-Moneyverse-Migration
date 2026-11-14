package com.moneyverse.api.domain.centralbank.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.centralbank.dto.CentralBankDtos.*;
import com.moneyverse.api.domain.centralbank.service.CentralBankService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Central Bank", description = "중앙은행 통화량 지표 및 기준금리/지급준비율 정책 API")
@RestController
@RequestMapping("/api/central-bank")
public class CentralBankController {

    private final CentralBankService centralBankService;

    public CentralBankController(CentralBankService centralBankService) {
        this.centralBankService = centralBankService;
    }

    @GetMapping("/monetary-aggregates")
    @Operation(summary = "M0(본원통화), M1(협의통화), M2(광의통화) 거시경제 통화량 및 통화승수 조회")
    public ApiResponse<MonetaryAggregates> getMonetaryAggregates() {
        return ApiResponse.ok(centralBankService.getMonetaryAggregates());
    }

    @GetMapping("/base-rate")
    @Operation(summary = "현재 국가 기준금리(Base Rate) 및 테일러 룰 추정 금리 조회")
    public ApiResponse<Map<String, Object>> getBaseRate() {
        return ApiResponse.ok(centralBankService.getBaseRate());
    }

    @PutMapping("/base-rate")
    @Operation(summary = "국가 기준금리(Base Rate) 결정 및 공시 (금융통화위원회)")
    public ApiResponse<Map<String, Object>> updateBaseRate(
            @RequestHeader(value = "X-Admin-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String adminId,
            @Valid @RequestBody UpdateBaseRateRequest request) {
        Map<String, Object> result = centralBankService.updateBaseRate(request.getBaseRateBps(), request.getReason(), adminId);
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @GetMapping("/reserve-requirement")
    @Operation(summary = "시중 상업은행 법정 지급준비율(Reserve Requirement Ratio) 조회")
    public ApiResponse<Map<String, Object>> getReserveRequirement() {
        return ApiResponse.ok(centralBankService.getReserveRequirement());
    }

    @PutMapping("/reserve-requirement")
    @Operation(summary = "시중 상업은행 법정 지급준비율 갱신 및 공시")
    public ApiResponse<Map<String, Object>> updateReserveRequirement(
            @RequestHeader(value = "X-Admin-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String adminId,
            @Valid @RequestBody UpdateReserveRequirementRequest request) {
        Map<String, Object> result = centralBankService.updateReserveRequirement(request.getReserveRatioBps(), request.getReason(), adminId);
        return ApiResponse.ok(result, (String) result.get("message"));
    }
}
