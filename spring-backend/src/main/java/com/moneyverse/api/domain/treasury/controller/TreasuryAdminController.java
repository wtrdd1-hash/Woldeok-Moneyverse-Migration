package com.moneyverse.api.domain.treasury.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.*;
import com.moneyverse.api.domain.treasury.service.TreasuryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@Tag(name = "Treasury Admin", description = "국고 및 조폐국, 국부펀드 관리자 API")
public class TreasuryAdminController {

    private static final Logger log = LoggerFactory.getLogger(TreasuryAdminController.class);

    private final TreasuryService treasuryService;

    public TreasuryAdminController(TreasuryService treasuryService) {
        this.treasuryService = treasuryService;
    }

    /**
     * 조폐국(MINT) 화폐발행 국고 직행 충전
     * 표준: /api/v1/admin/treasury/mint-topup
     * 호환: /api/treasury/mint-topup
     */
    @Operation(summary = "조폐국 화폐발행 국고 직행 충전")
    @PostMapping(path = {"/api/v1/admin/treasury/mint-topup", "/api/treasury/mint-topup"})
    public ApiResponse<TreasuryOperationResult> mintTopup(
            @Valid @RequestBody MintTopupRequest request
    ) {
        log.info("[API] POST mint-topup received: amount={}", request.getAmountWld());
        TreasuryOperationResult result = treasuryService.mintTopup(request);
        return ApiResponse.ok(result, "조폐국 화폐발행 국고 직행 충전이 성공적으로 집행되었습니다.");
    }

    /**
     * 국고 관리자 임금 지급
     * 표준: /api/v1/admin/treasury/salary/disburse
     * 호환: /api/treasury/salary/disburse
     */
    @Operation(summary = "국고 관리자 임금 지급")
    @PostMapping(path = {"/api/v1/admin/treasury/salary/disburse", "/api/treasury/salary/disburse"})
    public ApiResponse<TreasuryOperationResult> disburseSalary(
            @Valid @RequestBody SalaryDisburseRequest request
    ) {
        log.info("[API] POST salary/disburse received: amount={}", request.getAmountWld());
        TreasuryOperationResult result = treasuryService.disburseSalary(request);
        return ApiResponse.ok(result, "국고 관리자 임금 지급이 완료되었습니다.");
    }

    /**
     * 국부펀드(SWF) 포트폴리오 리밸런싱 실행
     */
    @Operation(summary = "국부펀드(SWF) 자동투자 리밸런싱 실행")
    @PostMapping("/api/v1/admin/treasury/swf/rebalance")
    public ApiResponse<Map<String, Object>> rebalanceSwf(
            @RequestBody(required = false) SwfRebalanceRequest request
    ) {
        log.info("[API] POST swf/rebalance received");
        Map<String, Object> result = treasuryService.rebalanceSwf(request != null ? request : new SwfRebalanceRequest());
        return ApiResponse.ok(result, "국부펀드(SWF) 자동투자 포트폴리오 리밸런싱이 완료되었습니다.");
    }

    /**
     * 국부펀드(SWF) 평가액 국고 환원
     */
    @Operation(summary = "국부펀드(SWF) 평가액 국고 환원")
    @PostMapping("/api/v1/admin/treasury/swf/liquidate")
    public ApiResponse<Map<String, Object>> liquidateSwf(
            @Valid @RequestBody SwfLiquidateRequest request
    ) {
        log.info("[API] POST swf/liquidate received: amount={}", request.getAmountWld());
        Map<String, Object> result = treasuryService.liquidateSwf(request);
        return ApiResponse.ok(result, "국부펀드(SWF) 평가액 국고 환원이 완료되었습니다.");
    }
}
