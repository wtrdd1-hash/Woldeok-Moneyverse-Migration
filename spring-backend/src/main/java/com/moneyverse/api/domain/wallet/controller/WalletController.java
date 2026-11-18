package com.moneyverse.api.domain.wallet.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.wallet.dto.WalletDtos.*;
import com.moneyverse.api.domain.wallet.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Tag(name = "Wallet", description = "유저 WLD 지갑 잔액 조회 및 P2P 이체 API")
@RestController
@RequestMapping(path = {"/api/wallet", "/api/v1/wallet"})
public class WalletController {

    private final WalletService walletService;
    private final UserAuthService authService;

    public WalletController(WalletService walletService, UserAuthService authService) {
        this.walletService = walletService;
        this.authService = authService;
    }

    private String resolveUserId(HttpServletRequest request, String headerUserId) {
        if (request != null) {
            Optional<UserAuthService.SessionInfo> sess = authService.resolveSession(request);
            if (sess.isPresent() && sess.get().isSignedIn() && sess.get().getUserId() != null) {
                return sess.get().getUserId().toString();
            }
        }
        if (headerUserId != null && !headerUserId.isBlank()) {
            return headerUserId.trim();
        }
        return "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
    }

    @GetMapping(path = {"/summary", "/api/wallet/summary", "/api/v1/wallet/summary"})
    @Operation(summary = "랜딩 페이지용 지갑 요약 (WalletGlance 컴포넌트 표준 규격)")
    public ResponseEntity<Map<String, Object>> getSummary(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {

        Optional<UserAuthService.SessionInfo> sess = authService.resolveSession(request);
        UUID userId = null;
        if (sess.isPresent() && sess.get().isSignedIn() && sess.get().getUserId() != null) {
            userId = sess.get().getUserId();
        } else if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                userId = UUID.fromString(headerUserId.trim());
            } catch (Exception ignored) {}
        }

        Map<String, Object> res = new LinkedHashMap<>();
        if (userId == null) {
            res.put("signedIn", false);
            res.put("currency", "WLD");
            res.put("totalAvailableAmount", null);
            return ResponseEntity.ok(res);
        }

        WalletOverview ov = walletService.getOverview(userId.toString());
        String total = ov.getBalanceWld() != null ? ov.getBalanceWld() : "0";

        res.put("signedIn", true);
        res.put("currency", "WLD");
        res.put("totalAvailableAmount", total);
        return ResponseEntity.ok(res);
    }

    @GetMapping(path = {"", "/", "/overview"})
    @Operation(summary = "내 지갑 종합 잔액 및 최근 거래 내역 조회")
    public ApiResponse<WalletOverview> getOverview(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String userId = resolveUserId(request, headerUserId);
        return ApiResponse.ok(walletService.getOverview(userId));
    }

    @GetMapping("/balance")
    @Operation(summary = "내 지갑 가용 잔액 단순 조회")
    public ApiResponse<Map<String, Object>> getBalance(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String userId = resolveUserId(request, headerUserId);
        WalletOverview ov = walletService.getOverview(userId);
        return ApiResponse.ok(Map.of("balanceWld", ov.getBalanceWld(), "currency", "WLD"));
    }

    @PostMapping("/transfer")
    @Operation(summary = "유저 간 WLD P2P 즉시 전송")
    public ApiResponse<Map<String, Object>> transfer(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @Valid @RequestBody TransferRequest req) {
        String userId = resolveUserId(request, headerUserId);
        Map<String, Object> result = walletService.transfer(userId, req.getRecipientUserId(), req.getAmountWld(), req.getMemo());
        return ApiResponse.ok(result, (String) result.get("message"));
    }
}
