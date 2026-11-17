package com.moneyverse.api.domain.wallet.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Deprecated Spring wallet endpoints used a caller-supplied/default user id and a
 * separate wallets table. They are disabled until an owner-bound ledger write
 * contract is implemented. The verified read-only web contract is /api/v1/wallet.
 */
@Tag(name = "Wallet Legacy Routes", description = "기존 신원 위조 가능 지갑 API 격리")
@RestController
@RequestMapping("/api/wallet")
public class WalletController {
    @GetMapping("/overview")
    @Operation(summary = "폐기된 지갑 개요 (원장 정합성 미검증으로 중단)")
    public ResponseEntity<Map<String, Object>> overview() {
        return retired();
    }

    @GetMapping("/balance")
    @Operation(summary = "폐기된 잔액 조회 (원장 정합성 미검증으로 중단)")
    public ResponseEntity<Map<String, Object>> balance() {
        return retired();
    }

    @PostMapping("/transfer")
    @Operation(summary = "폐기된 지갑 직접 SQL 이체 (실집행 중단)")
    public ResponseEntity<Map<String, Object>> transfer() {
        return retired();
    }

    private static ResponseEntity<Map<String, Object>> retired() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .header("Cache-Control", "private, no-store")
            .header("X-Robots-Tag", "noindex, nofollow")
            .body(Map.of("ok", false, "code", "WALLET_LEGACY_ENDPOINT_DISABLED"));
    }
}
