package com.moneyverse.api.domain.macropulse.controller;

import com.moneyverse.api.domain.macropulse.dto.MacroPulseDtos.*;
import com.moneyverse.api.domain.macropulse.service.MacroPulseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Macroeconomic Pulse & Burn Events", description = "거시 경제 지표 대시보드, 화폐 소각 이벤트 및 핫타임 버프 API")
@RestController
@RequestMapping({"/api/economy", "/api/v1/economy"})
public class MacroPulseController {

    private final MacroPulseService macroPulseService;

    public MacroPulseController(MacroPulseService macroPulseService) {
        this.macroPulseService = macroPulseService;
    }

    @GetMapping({"", "/", "/macro-pulse", "/pulse"})
    @Operation(summary = "거시 경제 펄스 종합 지표 조회")
    public ResponseEntity<MacroPulseResponse> getMacroPulse() {
        return ResponseEntity.ok(macroPulseService.getMacroPulse());
    }

    @GetMapping({"/burn-events", "/burn"})
    @Operation(summary = "화폐 소각 이벤트 내역 조회")
    public ResponseEntity<BurnEventListResponse> getBurnEvents() {
        return ResponseEntity.ok(macroPulseService.getBurnEvents());
    }

    @GetMapping({"/hot-time", "/events/hot-time"})
    @Operation(summary = "실시간 핫타임 버프 상태 조회")
    public ResponseEntity<HotTimeStatusResponse> getHotTimeStatus() {
        return ResponseEntity.ok(macroPulseService.getHotTimeStatus());
    }
}
