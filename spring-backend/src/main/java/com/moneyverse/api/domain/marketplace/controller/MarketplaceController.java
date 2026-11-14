package com.moneyverse.api.domain.marketplace.controller;

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
@RequestMapping("/api/marketplace")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    public MarketplaceController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
    }

    @GetMapping("/listings")
    @Operation(summary = "활성 마켓플레이스 아이템 매물 목록 조회")
    public ApiResponse<List<ListingItem>> listListings() {
        return ApiResponse.ok(marketplaceService.listListings());
    }

    @PostMapping("/listings")
    @Operation(summary = "마켓플레이스에 신규 아이템 매물 등록")
    public ApiResponse<Map<String, Object>> createListing(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @Valid @RequestBody CreateListingRequest request) {
        Map<String, Object> result = marketplaceService.createListing(userId, request);
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @PostMapping("/listings/{id}/buy")
    @Operation(summary = "등록된 매물 즉시 구매 및 결제")
    public ApiResponse<Map<String, Object>> buyListing(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId,
            @PathVariable("id") String listingId) {
        Map<String, Object> result = marketplaceService.buyListing(userId, listingId);
        return ApiResponse.ok(result, (String) result.get("message"));
    }
}
