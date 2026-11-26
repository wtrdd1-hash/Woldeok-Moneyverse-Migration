package com.moneyverse.api.domain.bond.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping({"/api/v1/bonds", "/api/bonds"})
public class BondController {

    private final BondService bondService;
    private final MemberApiGuard guard;

    public BondController(BondService bondService, MemberApiGuard guard) {
        this.bondService = bondService;
        this.guard = guard;
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

    /*
     * QA 2026-11-25 (critical): these took the member from an X-User-Id header
     * (fixed default member); subscribe/borrow/repay wrote bond tables directly.
     * Reads use the verified session owner; writes are refused until they go
     * through journaled DB functions (bank_purchase_bond / bank_redeem_bond).
     */
    @GetMapping("/my-holdings")
    public ApiResponse<?> myHoldings(HttpServletRequest request) {
        return ApiResponse.ok(bondService.listUserHoldings(guard.actor(request).toString()));
    }

    @GetMapping("/my-repo-loans")
    public ResponseEntity<?> myRepoLoans(HttpServletRequest request) {
        guard.actor(request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(java.util.Map.of("code", "BOND_REPO_SOURCE_UNAVAILABLE", "message", "Repo loan history has no journaled source"));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(HttpServletRequest request) {
        guard.verifiedMutationActor(request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(java.util.Map.of("code", "BOND_LEDGER_NOT_JOURNALED", "message", "Use the journaled bank bond purchase"));
    }

    @PostMapping("/repo-loans/borrow")
    public ResponseEntity<?> borrowRepo(HttpServletRequest request) {
        guard.verifiedMutationActor(request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(java.util.Map.of("code", "BOND_LEDGER_NOT_JOURNALED", "message", "Repo lending is unavailable pending journaled settlement"));
    }

    @PostMapping("/repo-loans/repay")
    public ResponseEntity<?> repayRepo(HttpServletRequest request) {
        guard.verifiedMutationActor(request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(java.util.Map.of("code", "BOND_LEDGER_NOT_JOURNALED", "message", "Repo lending is unavailable pending journaled settlement"));
    }
}

