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

@Tag(name = "Treasury Bonds", description = "媛??援?콈 怨듬え 泥?빟 諛??덊룷(Repo) ?대낫 ?異?API")
@RestController
@RequestMapping("/api/bonds")
public class BondController {

    private final BondService bondService;

    public BondController(BondService bondService) {
        this.bondService = bondService;
    }

    @GetMapping({"", "/", "/markets"})
    @Operation(summary = "媛??援?콈 醫낅ぉ 諛??쒖옣 湲덈━ 吏??議고쉶")
    public ApiResponse<Map<String, Object>> getMarkets() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("overview", bondService.getOverview());
        data.put("bonds", bondService.listBonds());
        data.put("guarantor", "寃뚯엫 ??媛??WLD 梨꾧텒?대ŉ 援?? ?좎슜?깃툒 諛??먮━湲?蹂댁쬆???곸슜?섏? ?딆뒿?덈떎.");
        data.put("disclosed_at", Instant.now().toString());
        return ApiResponse.ok(data);
    }

    @GetMapping("/my-holdings")
    @Operation(summary = "??蹂댁쑀 援?콈 怨꾩쥖 ?꾪솴 議고쉶")
    public ApiResponse<List<Map<String, Object>>> getMyHoldings(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId) {
        return ApiResponse.ok(bondService.listUserHoldings(userId));
    }

    @PostMapping("/subscribe")
    @Operation(summary = "?쒕? 媛??援?콈 怨듬え 泥?빟 諛?留ㅼ닔")
    public ApiResponse<Map<String, Object>> subscribeBond(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody BondSubscribeRequest request) {
        Map<String, Object> result = bondService.subscribeBond(userId, request.getBondId(), request.getUnits());
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @GetMapping("/my-repo-loans")
    @Operation(summary = "??援?콈 ?대낫 ?덊룷 ?異??댁뿭 議고쉶")
    public ApiResponse<List<Map<String, Object>>> getMyRepoLoans(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId) {
        return ApiResponse.ok(Collections.emptyList());
    }

    @PostMapping("/repo-loans/borrow")
    @Operation(summary = "援?콈 ?대낫 ?덊룷 ?異??ㅽ뻾")
    public ApiResponse<Map<String, Object>> borrowRepoLoan(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody RepoBorrowRequest request) {
        Map<String, Object> result = bondService.createRepoLoan(userId, request.getHoldingId());
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @PostMapping("/repo-loans/repay")
    @Operation(summary = "援?콈 ?대낫 ?덊룷 ?異??먮━湲??곹솚")
    public ApiResponse<Map<String, Object>> repayRepoLoan(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody RepoRepayRequest request) {
        Map<String, Object> result = bondService.repayRepoLoan(userId, request.getLoanId());
        return ApiResponse.ok(result, (String) result.get("message"));
    }
}

