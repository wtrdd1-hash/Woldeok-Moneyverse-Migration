package com.moneyverse.api.domain.marketplace.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.marketplace.dto.MarketplaceDtos.*;
import com.moneyverse.api.domain.marketplace.service.MarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Marketplace", description = "플레이어 간 아이템 및 자산 거래 P2P 마켓플레이스 API")
@RestController
@RequestMapping({"/api/marketplace", "/api/v1/marketplace"})
public class MarketplaceController {

    private final MarketplaceService marketplaceService;
    private final MemberApiGuard guard;

    public MarketplaceController(MarketplaceService marketplaceService, MemberApiGuard guard) {
        this.marketplaceService = marketplaceService;
        this.guard = guard;
    }

    @GetMapping("/listings")
    @Operation(summary = "활성 마켓플레이스 아이템 매물 목록 조회")
    public ApiResponse<List<ListingItem>> listListings() {
        return ApiResponse.ok(marketplaceService.listListings());
    }

    /*
     * QA 2026-11-25 (critical): both took the member from an X-User-Id header
     * (fixed default member) outside the session filter. marketplace_buy_listing
     * also moves account_balances without ledger postings, so no write is
     * acknowledged until a double-entry path exists.
     */
    @PostMapping("/listings")
    @Operation(summary = "Create listing: refused until double-entry settlement exists")
    public ResponseEntity<?> createListing(HttpServletRequest request) {
        guard.verifiedMutationActor(request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(java.util.Map.of("code", "MARKETPLACE_LEDGER_NOT_JOURNALED", "message", "Marketplace settlement is unavailable pending double-entry postings"));
    }

    @PostMapping("/listings/{id}/buy")
    @Operation(summary = "Buy listing: refused until double-entry settlement exists")
    public ResponseEntity<?> buyListing(HttpServletRequest request, @PathVariable("id") String listingId) {
        guard.verifiedMutationActor(request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(java.util.Map.of("code", "MARKETPLACE_LEDGER_NOT_JOURNALED", "message", "Marketplace settlement is unavailable pending double-entry postings"));
    }
}
