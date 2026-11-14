package com.moneyverse.api.domain.arena.controller;

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

    private final PvpArenaService pvpArenaService;

    public PvpArenaController(PvpArenaService pvpArenaService) {
        this.pvpArenaService = pvpArenaService;
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
    public ApiResponse<PvpRoomDto> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            @RequestHeader(value = "x-user-id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @RequestHeader(value = "x-user-name", defaultValue = "도전자") String userName
    ) {
        return ApiResponse.ok(pvpArenaService.createRoom(request, userId, userName), "대결방이 생성되었습니다.");
    }

    @Operation(summary = "대결방 참가 및 승패 정산 집행")
    @PostMapping(path = {
            "/api/arena/rooms/{roomId}/join",
            "/api/v1/arena/rooms/{roomId}/join"
    })
    public ApiResponse<Map<String, Object>> joinRoom(
            @PathVariable String roomId,
            @RequestBody JoinRoomRequest request,
            @RequestHeader(value = "x-user-id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @RequestHeader(value = "x-user-name", defaultValue = "응전자") String userName
    ) {
        return ApiResponse.ok(pvpArenaService.joinRoom(roomId, request, userId, userName), "대결이 완료되었습니다.");
    }

    @Operation(summary = "대결방 취소 및 판돈 환불")
    @PostMapping(path = {
            "/api/arena/rooms/{roomId}/cancel",
            "/api/v1/arena/rooms/{roomId}/cancel"
    })
    public ApiResponse<Map<String, Object>> cancelRoom(
            @PathVariable String roomId,
            @RequestHeader(value = "x-user-id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId
    ) {
        return ApiResponse.ok(pvpArenaService.cancelRoom(roomId, userId), "대결방이 취소되었습니다.");
    }
}
