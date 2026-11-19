package com.moneyverse.api.domain.bank.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.bank.service.PocketService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Tag(name = "Banking Pockets", description = "상업은행 목표 저축 포켓(Pocket) 생성, 관리 및 자금 이체 API")
@RestController
public class PocketController {

    private final PocketService pocketService;
    private final UserAuthService authService;

    public PocketController(PocketService pocketService, UserAuthService authService) {
        this.pocketService = pocketService;
        this.authService = authService;
    }

    private Optional<String> resolveUserId(HttpServletRequest request) {
        Optional<SessionInfo> session = authService.resolveSession(request);
        if (session.isPresent() && session.get().isSignedIn() && session.get().getUserId() != null) {
            return Optional.of(session.get().getUserId().toString());
        }
        return Optional.empty();
    }

    @GetMapping(path = {
            "/api/v1/banking/pockets",
            "/api/banking/pockets"
    })
    @Operation(summary = "내 모든 저축 포켓 목록 조회")
    public ResponseEntity<?> listPockets(HttpServletRequest request) {
        Optional<String> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }
        return ResponseEntity.ok(ApiResponse.ok(pocketService.listPockets(userId.get())));
    }

    @PostMapping(path = {
            "/api/v1/banking/pockets",
            "/api/banking/pockets"
    })
    @Operation(summary = "신규 저축 포켓 생성")
    public ResponseEntity<?> createPocket(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        Optional<String> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        String name = (String) body.getOrDefault("name", "내 목표 포켓");
        Number target = (Number) body.get("targetAmount");
        Long targetAmount = target != null ? target.longValue() : null;
        String targetDate = (String) body.get("targetDate");
        String themeColor = (String) body.getOrDefault("themeColor", "#3B82F6");
        String iconCode = (String) body.getOrDefault("iconCode", "SAVINGS");

        Map<String, Object> created = pocketService.createPocket(userId.get(), name, targetAmount, targetDate, themeColor, iconCode);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created, "Pocket created"));
    }

    @PostMapping(path = {
            "/api/v1/banking/pockets/{id}/transfer",
            "/api/banking/pockets/{id}/transfer"
    })
    @Operation(summary = "포켓 자금 입출금 이체")
    public ResponseEntity<?> transferPocket(
            HttpServletRequest request,
            @PathVariable("id") String pocketId,
            @RequestBody Map<String, Object> body) {
        Optional<String> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        String direction = (String) body.getOrDefault("direction", "IN");
        Number amt = (Number) body.get("amount");
        Long amount = amt != null ? amt.longValue() : 0L;

        try {
            Map<String, Object> result = pocketService.transferPocket(userId.get(), pocketId, direction, amount);
            return ResponseEntity.ok(ApiResponse.ok(result, "Transfer successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping(path = {
            "/api/v1/banking/pockets/{id}",
            "/api/banking/pockets/{id}"
    })
    @Operation(summary = "포켓 디자인 커스텀 (테마 색상, 아이콘)")
    public ResponseEntity<?> customizePocket(
            HttpServletRequest request,
            @PathVariable("id") String pocketId,
            @RequestBody Map<String, Object> body) {
        Optional<String> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        String themeColor = (String) body.getOrDefault("themeColor", "#10B981");
        String iconCode = (String) body.getOrDefault("iconCode", "STAR");

        Map<String, Object> result = pocketService.customizePocket(userId.get(), pocketId, themeColor, iconCode);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping(path = {
            "/api/v1/banking/pockets/{id}/archive",
            "/api/banking/pockets/{id}/archive"
    })
    @Operation(summary = "포켓 해지 및 잔액 회수")
    public ResponseEntity<?> archivePocket(
            HttpServletRequest request,
            @PathVariable("id") String pocketId) {
        Optional<String> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        Map<String, Object> result = pocketService.archivePocket(userId.get(), pocketId);
        return ResponseEntity.ok(ApiResponse.ok(result, "Pocket archived and balance recovered"));
    }
}
