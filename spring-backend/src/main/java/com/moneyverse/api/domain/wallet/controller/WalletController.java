package com.moneyverse.api.domain.wallet.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.wallet.dto.WalletDtos.*;
import com.moneyverse.api.domain.wallet.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Wallet", description = "유저 WLD 지갑 잔액 조회 및 P2P 이체 API")
@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/overview")
    @Operation(summary = "내 지갑 종합 잔액 및 최근 거래 내역 조회")
    public ApiResponse<WalletOverview> getOverview(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId) {
        return ApiResponse.ok(walletService.getOverview(userId));
    }

    @GetMapping("/balance")
    @Operation(summary = "내 지갑 가용 잔액 단순 조회")
    public ApiResponse<Map<String, Object>> getBalance(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId) {
        WalletOverview ov = walletService.getOverview(userId);
        return ApiResponse.ok(Map.of("balanceWld", ov.getBalanceWld(), "currency", "WLD"));
    }

    @PostMapping("/transfer")
    @Operation(summary = "유저 간 WLD P2P 즉시 전송")
    public ApiResponse<Map<String, Object>> transfer(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody TransferRequest request) {
        Map<String, Object> result = walletService.transfer(userId, request.getRecipientUserId(), request.getAmountWld(), request.getMemo());
        return ApiResponse.ok(result, (String) result.get("message"));
    }
}
