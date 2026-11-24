package com.moneyverse.api.domain.bank.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.bank.dto.BankDtos.*;
import com.moneyverse.api.domain.bank.service.BankService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Banking", description = "상업은행 복리 예금, 저금통 및 여수신 계좌 API")
@RestController
@RequestMapping(path = {"/api/banking", "/api/v1/banking", "/api/bank", "/api/v1/bank"})
public class BankController {

    private final BankService bankService;
    private final UserAuthService auth;

    public BankController(BankService bankService, UserAuthService auth) {
        this.bankService = bankService;
        this.auth = auth;
    }

    private String resolveUserId(HttpServletRequest request, String headerUserId) {
        var session = auth.resolveSession(request);
        if (session.isPresent() && session.get().isSignedIn() && session.get().getUserId() != null) {
            return session.get().getUserId().toString();
        }
        if (headerUserId != null && !headerUserId.isBlank()) {
            return headerUserId.trim();
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요한 금융 서비스입니다.");
    }

    @GetMapping(path = {"/standing", "/loans", ""})
    @Operation(summary = "내 은행 계좌 요약 (현금, 예금 잔액, 이자율, 대출 현황)")
    public ApiResponse<BankStanding> getStanding(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String uid = resolveUserId(request, userId);
        return ApiResponse.ok(bankService.getStanding(uid));
    }

    @PostMapping("/deposit")
    @Operation(summary = "은행 복리 정기 예금 계좌로 WLD 현금 입금")
    public ApiResponse<Map<String, Object>> deposit(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody BankTransferRequest transferRequest) {
        String uid = resolveUserId(request, userId);
        Map<String, Object> result = bankService.deposit(uid, transferRequest.getAmountWld(), transferRequest.getIdempotencyKey());
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @PostMapping("/withdraw")
    @Operation(summary = "은행 예금 계좌에서 지갑으로 WLD 인출")
    public ApiResponse<Map<String, Object>> withdraw(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody BankTransferRequest transferRequest) {
        String uid = resolveUserId(request, userId);
        Map<String, Object> result = bankService.withdraw(uid, transferRequest.getAmountWld(), transferRequest.getIdempotencyKey());
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @PostMapping("/movements")
    @Operation(summary = "현금과 은행 예금 간 이체")
    public ApiResponse<Map<String, Object>> movements(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody BankTransferRequest transferRequest) {
        String uid = resolveUserId(request, userId);
        String direction = transferRequest.getDirection();
        if ("withdraw".equalsIgnoreCase(direction)) {
            Map<String, Object> result = bankService.withdraw(uid, transferRequest.getAmountWld(), transferRequest.getIdempotencyKey());
            return ApiResponse.ok(result, (String) result.get("message"));
        } else {
            Map<String, Object> result = bankService.deposit(uid, transferRequest.getAmountWld(), transferRequest.getIdempotencyKey());
            return ApiResponse.ok(result, (String) result.get("message"));
        }
    }

    @PostMapping("/claim-interest")
    @Operation(summary = "실시간 누적 복리 이자 즉시 수령")
    public ApiResponse<Map<String, Object>> claimInterest(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody(required = false) Map<String, String> body) {
        String uid = resolveUserId(request, userId);
        String key = body != null ? body.get("idempotencyKey") : null;
        Map<String, Object> result = bankService.claimInterest(uid, key);
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @GetMapping("/pockets")
    @Operation(summary = "사용자 비상금 저금통(목표 적금 팟) 목록 조회")
    public ApiResponse<List<Map<String, Object>>> getPockets(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String uid = resolveUserId(request, userId);
        return ApiResponse.ok(bankService.listPockets(uid));
    }

    @PostMapping("/pockets")
    @Operation(summary = "새 비상금 저금통 생성")
    public ApiResponse<Map<String, Object>> createPocket(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody PocketCreateRequest pocketRequest) {
        String uid = resolveUserId(request, userId);
        Map<String, Object> result = bankService.createPocket(uid, pocketRequest);
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @PostMapping("/pockets/{id}/transfer")
    @Operation(summary = "은행 예금과 저금통 간 잔액 이동")
    public ApiResponse<Map<String, Object>> transferPocket(
            HttpServletRequest request,
            @PathVariable("id") UUID pocketId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody PocketTransferRequest transferRequest) {
        String uid = resolveUserId(request, userId);
        Map<String, Object> result = bankService.transferPocket(uid, pocketId, transferRequest.getDirection(), transferRequest.getAmountWld(), transferRequest.getIdempotencyKey());
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @PostMapping("/borrow")
    @Operation(summary = "가상 신용 대출 실행")
    public ApiResponse<Map<String, Object>> borrow(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody LoanRequest loanRequest) {
        String uid = resolveUserId(request, userId);
        Map<String, Object> result = bankService.borrowSmart(uid, loanRequest.getPrincipalAmount(), loanRequest.getIdempotencyKey());
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @PostMapping("/repay")
    @Operation(summary = "가상 대출 원리금 상환")
    public ApiResponse<Map<String, Object>> repay(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody LoanRequest loanRequest) {
        String uid = resolveUserId(request, userId);
        UUID loanId = null;
        if (loanRequest.getLoanId() != null && !loanRequest.getLoanId().isBlank()) {
            try {
                loanId = UUID.fromString(loanRequest.getLoanId().trim());
            } catch (Exception ignored) {}
        }
        Map<String, Object> result = bankService.repayLoan(uid, loanId, loanRequest.getPrincipalAmount(), loanRequest.getIdempotencyKey());
        return ApiResponse.ok(result, (String) result.get("message"));
    }
}
