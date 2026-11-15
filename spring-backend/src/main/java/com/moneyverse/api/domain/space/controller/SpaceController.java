package com.moneyverse.api.domain.space.controller;

import com.moneyverse.api.domain.space.dto.SpaceDtos.*;
import com.moneyverse.api.domain.space.service.SpaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Personal Space & Real Estate", description = "마이 스페이스, 가구 배치 및 부동산 보유세 납부 API")
@RestController
@RequestMapping({"/api/space", "/api/v1/space"})
public class SpaceController {

    private final SpaceService spaceService;

    public SpaceController(SpaceService spaceService) {
        this.spaceService = spaceService;
    }

    private UUID resolveUserUuid(String xUserId, String xActorUserId) {
        String raw = (xUserId != null && !xUserId.isBlank()) ? xUserId.trim()
                : (xActorUserId != null && !xActorUserId.isBlank()) ? xActorUserId.trim()
                : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            return UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20");
        }
    }

    @GetMapping("/my")
    @Operation(summary = "내가 소유한 공간 목록 조회")
    public ResponseEntity<MySpaceResponse> getMySpaces(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(spaceService.getMySpaces(userId));
    }

    @PostMapping("/purchase")
    @Operation(summary = "새로운 공간 구매")
    public ResponseEntity<SpaceActionResponse> purchaseSpace(
            @RequestBody PurchaseSpaceRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(spaceService.purchaseSpace(userId, req));
    }

    @PutMapping("/{id}/layout")
    @Operation(summary = "공간 가구/인테리어 배치 저장")
    public ResponseEntity<SpaceActionResponse> updateLayout(
            @PathVariable("id") UUID id,
            @RequestBody UpdateLayoutRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(spaceService.updateLayout(userId, id, req.layout()));
    }

    @PostMapping("/{id}/tax")
    @Operation(summary = "부동산 보유세 납부")
    public ResponseEntity<SpaceActionResponse> payTax(
            @PathVariable("id") UUID id,
            @RequestBody PayTaxRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(spaceService.payTax(userId, id, req.days()));
    }
}
