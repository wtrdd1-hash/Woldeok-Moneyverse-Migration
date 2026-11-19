package com.moneyverse.api.domain.gameclock.controller;

import com.moneyverse.api.domain.gameclock.dto.GameClockDtos.ServerGameClockResponse;
import com.moneyverse.api.domain.gameclock.service.GameClockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Game Clock", description = "가상 세계 시간/주기 동기화 API")
@RestController
@RequestMapping({"/api/game-clock", "/api/v1/game-clock", "/app-api/v1/game-clock"})
public class GameClockController {

    private final GameClockService gameClockService;

    public GameClockController(GameClockService gameClockService) {
        this.gameClockService = gameClockService;
    }

    @GetMapping({"", "/"})
    @Operation(summary = "현재 가상 세계 일/주차 시계 동기화 상태 조회")
    public ResponseEntity<ServerGameClockResponse> current() {
        return ResponseEntity.ok(gameClockService.current());
    }
}
