package com.moneyverse.api.domain.arena.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.arena.dto.PvpDtos.*;
import com.moneyverse.api.domain.arena.service.PvpArenaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "PvP Wager Arena", description = "1:1 내기 대결장 및 실시간 베팅 정산 API")
public class PvpArenaController {

    private final MemberApiGuard guard;
    private final PvpArenaService pvpArenaService;

    public PvpArenaController(PvpArenaService pvpArenaService, MemberApiGuard guard) {
        this.pvpArenaService = pvpArenaService;
        this.guard = guard;
    }

    @Operation(summary = "활성 및 최근 대결방 목록 조회")
    @GetMapping(path = {
            "/api/arena/rooms",
            "/api/v1/arena/rooms"
    })
    public ApiResponse<List<PvpRoomDto>> listRooms() {
        return ApiResponse.ok(pvpArenaService.listRooms());
    }

    @Operation(summary = "신규 1:1 대결방 생성")
    @PostMapping(path = {
            "/api/arena/rooms",
            "/api/v1/arena/rooms"
    })
    public ResponseEntity<?> createRoom(HttpServletRequest request) {
        guard.verifiedMutationActor(request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("code", "ARENA_SETTLEMENT_NOT_JOURNALED", "message", "Arena stakes are unavailable pending journaled escrow and settlement"));
    }

    @Operation(summary = "대결방 참가 및 승패 정산 집행")
    @PostMapping(path = {
            "/api/arena/rooms/{roomId}/join",
            "/api/v1/arena/rooms/{roomId}/join"
    })
    public ResponseEntity<?> joinRoom(HttpServletRequest request, @PathVariable String roomId) {
        guard.verifiedMutationActor(request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("code", "ARENA_SETTLEMENT_NOT_JOURNALED", "message", "Arena stakes are unavailable pending journaled escrow and settlement"));
    }

    @Operation(summary = "대결방 취소 및 판돈 환불")
    @PostMapping(path = {
            "/api/arena/rooms/{roomId}/cancel",
            "/api/v1/arena/rooms/{roomId}/cancel"
    })
    public ResponseEntity<?> cancelRoom(HttpServletRequest request, @PathVariable String roomId) {
        guard.verifiedMutationActor(request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("code", "ARENA_SETTLEMENT_NOT_JOURNALED", "message", "Arena stakes are unavailable pending journaled escrow and settlement"));
    }
}
