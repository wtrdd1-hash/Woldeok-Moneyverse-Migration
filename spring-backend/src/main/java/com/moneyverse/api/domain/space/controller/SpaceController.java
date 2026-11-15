package com.moneyverse.api.domain.space.controller;

import com.moneyverse.api.domain.space.dto.SpaceDtos.*;
import com.moneyverse.api.domain.space.service.SpaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Personal Space & Real Estate", description = "마이 스페이스, 가구 배치 및 부동산 보유세 납부 API")
@RestController
@RequestMapping({"/api/space", "/api/v1/space", "/api/spaces", "/api/v1/spaces"})
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

    @GetMapping({"", "/"})
    @Operation(summary = "내 소유 공간 목록 및 개요 조회")
    public ResponseEntity<MySpaceResponse> getSpacesRoot(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(spaceService.getMySpaces(userId));
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

    @GetMapping("/real-estate/districts")
    @Operation(summary = "가상 부동산 메타버스 특별 구역 목록 조회")
    public ResponseEntity<Map<String, Object>> listDistricts() {
        return ResponseEntity.ok(Map.of(
                "districts", List.of(
                        Map.of(
                                "id", "district-gangnam-teheran",
                                "name", "강남 테헤란로 밸리",
                                "description", "월덕 금융 및 IT 메가 벤처 본사 집중 구역 (상업용 최고 등급)",
                                "floorPriceWld", 15000000,
                                "totalLands", 100,
                                "occupancyRatePercent", 88,
                                "dailyTaxRatePercent", 0.05
                        ),
                        Map.of(
                                "id", "district-yeouido-finance",
                                "name", "여의도 국제 금융가",
                                "description", "증권사 및 헤지펀드 집결지",
                                "floorPriceWld", 20000000,
                                "totalLands", 80,
                                "occupancyRatePercent", 92,
                                "dailyTaxRatePercent", 0.06
                        )
                )
        ));
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
