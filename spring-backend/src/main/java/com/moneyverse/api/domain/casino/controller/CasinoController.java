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
@RequestMapping("/api/casino")
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

    @PostMapping("/play")
    @Operation(summary = "슬롯/룰렛/하이로우 미니게임 베팅 집행")
    public ApiResponse<Map<String, Object>> play(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody CasinoPlayRequest request) {
        Map<String, Object> result = casinoService.play(userId, request);
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @PostMapping("/dice/play")
    @Operation(summary = "주사위 확률 베팅 집행")
    public ApiResponse<Map<String, Object>> playDice(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody CasinoPlayRequest request) {
        Map<String, Object> result = casinoService.play(userId, request);
        return ApiResponse.ok(result, (String) result.get("message"));
    }
}
