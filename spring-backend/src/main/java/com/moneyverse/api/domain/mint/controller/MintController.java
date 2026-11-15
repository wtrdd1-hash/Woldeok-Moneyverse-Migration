package com.moneyverse.api.domain.mint.controller;

import com.moneyverse.api.domain.mint.dto.MintDtos.*;
import com.moneyverse.api.domain.mint.service.MintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "National Mint & Currency Sinks", description = "국가조폐국 본원통화 주조, 시뇨리지 대시보드 및 통화 영구 소각 API")
@RestController
@RequestMapping({"/api/mint", "/api/v1/mint"})
public class MintController {

    private final MintService mintService;

    public MintController(MintService mintService) {
        this.mintService = mintService;
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

    @GetMapping("/batches")
    @Operation(summary = "화폐 주조 배치 및 인수 상태 목록 조회")
    public ResponseEntity<MintBatchListResponse> getBatches() {
        return ResponseEntity.ok(mintService.getBatches());
    }

    @GetMapping("/batches/{id}")
    @Operation(summary = "특정 주조 배치 상세 정보 조회")
    public ResponseEntity<MintBatchItem> getBatchById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(mintService.getBatchById(id));
    }

    @GetMapping("/seigniorage")
    @Operation(summary = "조폐국 주조차익(시뇨리지) 및 통화 순환 원장 조회")
    public ResponseEntity<SeigniorageLedgerResponse> getSeigniorageLedger() {
        return ResponseEntity.ok(mintService.getSeigniorageLedger());
    }

    @PostMapping("/batches")
    @Operation(summary = "신규 본원통화(M0) 주조 배치 생성")
    public ResponseEntity<MintActionResponse> createMintBatch(
            @RequestBody CreateMintBatchRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID actorId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(mintService.createMintBatch(actorId, req));
    }

    @PostMapping("/burn")
    @Operation(summary = "통화 영구 소각(Destroy) 집행")
    public ResponseEntity<MintActionResponse> burnCurrency(
            @RequestBody BurnCurrencyRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID actorId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(mintService.burnCurrency(actorId, req));
    }
}
