package com.moneyverse.api.domain.bank.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.bank.dto.BankDtos.*;
import com.moneyverse.api.domain.bank.service.BankService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Banking", description = "상업은행 복리 예금 및 여수신 계좌 API")
@RestController
@RequestMapping("/api/banking")
public class BankController {

    private final BankService bankService;

    public BankController(BankService bankService) {
        this.bankService = bankService;
    }

    @GetMapping("/standing")
    @Operation(summary = "내 은행 계좌 요약 (현금, 예금 잔액, 이자율, 대출 현황)")
    public ApiResponse<BankStanding> getStanding(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId) {
        return ApiResponse.ok(bankService.getStanding(userId));
    }

    @PostMapping("/deposit")
    @Operation(summary = "은행 복리 정기 예금 계좌로 WLD 현금 입금")
    public ApiResponse<Map<String, Object>> deposit(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody BankTransferRequest request) {
        Map<String, Object> result = bankService.deposit(userId, request.getAmountWld());
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @PostMapping("/withdraw")
    @Operation(summary = "은행 예금 계좌에서 지갑으로 WLD 인출")
    public ApiResponse<Map<String, Object>> withdraw(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody BankTransferRequest request) {
        Map<String, Object> result = bankService.withdraw(userId, request.getAmountWld());
        return ApiResponse.ok(result, (String) result.get("message"));
    }
}
