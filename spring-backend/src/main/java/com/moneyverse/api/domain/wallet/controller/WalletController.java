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
    private final com.moneyverse.api.domain.identity.service.MemberApiGuard memberApiGuard;

    public WalletController(WalletService walletService, UserAuthService authService,
                            com.moneyverse.api.domain.identity.service.MemberApiGuard memberApiGuard) {
        this.walletService = walletService;
        this.authService = authService;
        this.memberApiGuard = memberApiGuard;
    }

    /** Owner identity MUST originate from the verified server session, never from a client header. */
    private String resolveUserId(HttpServletRequest request, String ignoredClientUserId) {
        if (request != null) {
            Optional<UserAuthService.SessionInfo> sess = authService.resolveSession(request);
            if (sess.isPresent() && sess.get().isSignedIn() && sess.get().getUserId() != null) {
                return sess.get().getUserId().toString();
            }
        }
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "verified wallet session required");
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

    /**
     * The NestJS route the wallet page calls (route contract 2026-11-26: missing in Spring).
     * Session + CSRF; the key and recipient travel in the body; the same journaled
     * economy_transfer as /transfer. Self-transfer and inactive recipients are refused.
     */
    @PostMapping("/transfers")
    @Operation(summary = "Send WLD to another member (journaled; session, CSRF, idempotency key)")
    public ApiResponse<Map<String, Object>> transfers(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = memberApiGuard.verifiedMutationActor(request);
        String recipientText = body != null && body.get("recipientUserId") instanceof String s ? s.trim() : null;
        String amountText = body == null ? null : body.get("amount") instanceof Number n ? String.valueOf(n) : body.get("amount") instanceof String s ? s.trim() : null;
        UUID key = memberApiGuard.idempotencyKey(body != null && body.get("idempotencyKey") instanceof String s ? s : null);
        UUID recipient;
        try { recipient = UUID.fromString(String.valueOf(recipientText)); }
        catch (Exception e) { throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "RECIPIENT_INVALID"); }
        if (amountText == null || !amountText.matches("^[1-9][0-9]{0,17}$")) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "AMOUNT_INVALID");
        }
        if (recipient.equals(actor)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "SELF_TRANSFER_REFUSED");
        }
        if (!walletService.isActiveRecipient(recipient)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "recipient is unavailable");
        }
        Map<String, Object> result = walletService.transferCanonicalWithIdempotencyKey(actor.toString(), recipient.toString(), amountText, null, key);
        Map<String, Object> receipt = new java.util.LinkedHashMap<>();
        receipt.put("transactionId", result.get("txId"));
        receipt.put("recipientUserId", recipient.toString());
        receipt.put("amount", amountText);
        return ApiResponse.ok(receipt, (String) result.get("message"));
    }

    @PostMapping("/transfer")
    @Operation(summary = "유저 간 WLD P2P 즉시 전송")
    public ApiResponse<Map<String, Object>> transfer(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "Idempotency-Key", required = false) String stableRequestKey,
            @Valid @RequestBody TransferRequest req) {
        String userId = resolveUserId(request, headerUserId);
        UUID key;
        try { key = UUID.fromString(stableRequestKey); }
        catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "valid Idempotency-Key UUID required");
        }
        Map<String, Object> result = walletService.transferCanonicalWithIdempotencyKey(
                userId, req.getRecipientUserId(), req.getAmountWld(), req.getMemo(), key);
        return ApiResponse.ok(result, (String) result.get("message"));
    }
}
