package com.moneyverse.api.domain.bond.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.bond.dto.BondDtos.*;
import com.moneyverse.api.domain.bond.service.BondService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@Tag(name = "Treasury Bonds", description = "가상 국채 공모 청약 및 레포(Repo) 담보 대출 API")
@RestController
@RequestMapping("/api/bonds")
public class BondController {

    private final BondService bondService;

    public BondController(BondService bondService) {
        this.bondService = bondService;
    }

    @GetMapping("/markets")
    @Operation(summary = "가상 국채 종목 및 시장 금리 지표 조회")
    public ApiResponse<Map<String, Object>> getMarkets() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("overview", bondService.getOverview());
        data.put("bonds", bondService.listBonds());
        data.put("guarantor", "게임 내 가상 WLD 채권이며 국가 신용등급 및 원리금 보증이 적용되지 않습니다.");
        data.put("disclosed_at", Instant.now().toString());
        return ApiResponse.ok(data);
    }

    @GetMapping("/my-holdings")
    @Operation(summary = "내 보유 국채 계좌 현황 조회")
    public ApiResponse<List<Map<String, Object>>> getMyHoldings(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId) {
        return ApiResponse.ok(bondService.listUserHoldings(userId));
    }

    @PostMapping("/subscribe")
    @Operation(summary = "시민 가상 국채 공모 청약 및 매수")
    public ApiResponse<Map<String, Object>> subscribeBond(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody BondSubscribeRequest request) {
        Map<String, Object> result = bondService.subscribeBond(userId, request.getBondId(), request.getUnits());
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @GetMapping("/my-repo-loans")
    @Operation(summary = "내 국채 담보 레포 대출 내역 조회")
    public ApiResponse<List<Map<String, Object>>> getMyRepoLoans(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId) {
        return ApiResponse.ok(Collections.emptyList());
    }

    @PostMapping("/repo-loans/borrow")
    @Operation(summary = "국채 담보 레포 대출 실행")
    public ApiResponse<Map<String, Object>> borrowRepoLoan(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody RepoBorrowRequest request) {
        Map<String, Object> result = bondService.createRepoLoan(userId, request.getHoldingId());
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @PostMapping("/repo-loans/repay")
    @Operation(summary = "국채 담보 레포 대출 원리금 상환")
    public ApiResponse<Map<String, Object>> repayRepoLoan(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody RepoRepayRequest request) {
        Map<String, Object> result = bondService.repayRepoLoan(userId, request.getLoanId());
        return ApiResponse.ok(result, (String) result.get("message"));
    }
}
