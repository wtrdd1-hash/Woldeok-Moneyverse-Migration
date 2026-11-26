package com.moneyverse.api.domain.casino.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.casino.dto.CasinoDtos.*;
import com.moneyverse.api.domain.casino.service.CasinoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Casino", description = "공정 검증(Provably Fair) 웹 카지노 및 미니게임 API")
@RestController
@RequestMapping({"/api/v1/casino", "/api/casino"})
public class CasinoController {

    private final CasinoService casinoService;

    public CasinoController(CasinoService casinoService) {
        this.casinoService = casinoService;
    }

    @GetMapping("/stats")
    @Operation(summary = "카지노 전체 누적 베팅액 및 환급률(RTP) 통계 조회")
    public ApiResponse<CasinoStats> getStats() {
        return ApiResponse.ok(casinoService.getStats());
    }

    /**
     * Retired (QA 2026-11-25, audit P0): these took the member id from an
     * X-User-Id header with a fixed default member. Plays now go through
     * /coin/plays, /dice/plays and /theme/plays with the verified session owner.
     */
    @PostMapping({"/play", "/dice/play"})
    @Operation(summary = "Retired: use /coin/plays, /dice/plays or /theme/plays")
    public org.springframework.http.ResponseEntity<Map<String, Object>> retiredPlay() {
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.GONE)
                .body(Map.of("code", "CASINO_ROUTE_RETIRED", "use", "/api/v1/casino/coin/plays"));
    }
}
