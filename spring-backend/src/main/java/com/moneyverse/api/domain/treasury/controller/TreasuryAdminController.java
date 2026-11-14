package com.moneyverse.api.domain.treasury.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.*;
import com.moneyverse.api.domain.treasury.service.TreasuryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
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
     * 호환: /api/admin/treasury/mint-topup, /api/treasury/mint-topup
     */
    @Operation(summary = "조폐국 화폐발행 국고 직행 충전")
    @PostMapping(path = {
            "/api/v1/admin/treasury/mint-topup",
            "/api/admin/treasury/mint-topup",
            "/api/treasury/mint-topup",
            "/api/v1/treasury/mint-topup"
    })
    public ApiResponse<TreasuryOperationResult> mintTopup(
            @Valid @RequestBody MintTopupRequest request
    ) {
        log.info("[API] POST mint-topup received: amount={}", request.getAmountWld());
        TreasuryOperationResult result = treasuryService.mintTopup(request);
        return ApiResponse.okWithResult(result, result.getResult(), "조폐국 화폐발행 국고 직행 충전이 성공적으로 집행되었습니다.");
    }

    /**
     * 국고 관리자 임금 지급
     * 표준: /api/v1/admin/treasury/salary/disburse
     * 호환: /api/admin/treasury/salary/disburse, /api/treasury/salary/disburse
     */
    @Operation(summary = "국고 관리자 임금 지급")
    @PostMapping(path = {
            "/api/v1/admin/treasury/salary/disburse",
            "/api/admin/treasury/salary/disburse",
            "/api/treasury/salary/disburse",
            "/api/v1/treasury/salary/disburse"
    })
    public ApiResponse<TreasuryOperationResult> disburseSalary(
            @Valid @RequestBody SalaryDisburseRequest request
    ) {
        log.info("[API] POST salary/disburse received: amount={}", request.getAmountWld());
        TreasuryOperationResult result = treasuryService.disburseSalary(request);
        return ApiResponse.okWithResult(result, result.getResult(), "국고 관리자 임금 지급이 완료되었습니다.");
    }

    /**
     * 국부펀드(SWF) 스냅샷 조회 (설정, 포트폴리오 목록, 최근 이벤트)
     */
    @Operation(summary = "국부펀드(SWF) 스냅샷 조회")
    @GetMapping(path = {
            "/api/v1/admin/treasury/swf",
            "/api/admin/treasury/swf",
            "/api/treasury/swf",
            "/api/v1/treasury/swf"
    })
    public ResponseEntity<Map<String, Object>> getSwfSnapshot() {
        log.info("[API] GET swf snapshot received");
        Map<String, Object> snapshot = treasuryService.getSwfSnapshot();
        return ResponseEntity.ok(snapshot);
    }

    /**
     * 국부펀드(SWF) 거버넌스 정책 설정 변경
     */
    @Operation(summary = "국부펀드(SWF) 정책 설정 변경")
    @PutMapping(path = {
            "/api/v1/admin/treasury/swf",
            "/api/admin/treasury/swf",
            "/api/treasury/swf",
            "/api/v1/treasury/swf"
    })
    public ResponseEntity<Map<String, Object>> updateSwfPolicy(
            @RequestBody Map<String, Object> body
    ) {
        log.info("[API] PUT swf policy update received: body={}", body);
        Map<String, Object> result = treasuryService.updateSwfPolicy(body);
        return ResponseEntity.ok(result);
    }

    /**
     * 국부펀드(SWF) 포트폴리오 리밸런싱 실행
     */
    @Operation(summary = "국부펀드(SWF) 자동투자 리밸런싱 실행")
    @PostMapping(path = {
            "/api/v1/admin/treasury/swf/rebalance",
            "/api/admin/treasury/swf/rebalance",
            "/api/treasury/swf/rebalance",
            "/api/v1/treasury/swf/rebalance"
    })
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
    @PostMapping(path = {
            "/api/v1/admin/treasury/swf/liquidate",
            "/api/admin/treasury/swf/liquidate",
            "/api/treasury/swf/liquidate",
            "/api/v1/treasury/swf/liquidate"
    })
    public ApiResponse<Map<String, Object>> liquidateSwf(
            @Valid @RequestBody SwfLiquidateRequest request
    ) {
        log.info("[API] POST swf/liquidate received: amount={}", request.getAmountWld());
        Map<String, Object> result = treasuryService.liquidateSwf(request);
        return ApiResponse.ok(result, "국부펀드(SWF) 평가액 국고 환원이 완료되었습니다.");
    }
}
