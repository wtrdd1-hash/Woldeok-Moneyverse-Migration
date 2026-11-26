package com.moneyverse.api.domain.market.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.market.dto.BlackMarketDtos.*;
import com.moneyverse.api.domain.market.service.BlackMarketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@Tag(name = "Black Market Auctions", description = "블랙마켓 비밀 옥션 및 입찰 정산 API")
public class BlackMarketController {

    private final MemberApiGuard guard;
    private final BlackMarketService blackMarketService;

    public BlackMarketController(BlackMarketService blackMarketService, MemberApiGuard guard) {
        this.blackMarketService = blackMarketService;
        this.guard = guard;
    }

    @Operation(summary = "진행 중인 비밀 옥션 물품 목록 조회")
    @GetMapping(path = {
            "/api/market/secret-auction",
            "/api/v1/market/secret-auction"
    })
    public ApiResponse<AuctionsResponse> listAuctions() {
        return ApiResponse.ok(new AuctionsResponse(blackMarketService.listAuctions()));
    }

    @Operation(summary = "특정 옥션의 실시간 입찰 이력 조회")
    @GetMapping(path = {
            "/api/market/secret-auction/{auctionId}/bid",
            "/api/v1/market/secret-auction/{auctionId}/bid"
    })
    public ApiResponse<BidLogsResponse> listBidLogs(@PathVariable String auctionId) {
        return ApiResponse.ok(new BidLogsResponse(blackMarketService.listBidLogs(auctionId)));
    }

    @Operation(summary = "비밀 옥션 신규 입찰 집행")
    @PostMapping(path = {
            "/api/market/secret-auction/{auctionId}/bid",
            "/api/v1/market/secret-auction/{auctionId}/bid"
    })
    public ResponseEntity<?> placeBid(HttpServletRequest request, @PathVariable String auctionId) {
        guard.verifiedMutationActor(request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("code", "SECRET_AUCTION_SETTLEMENT_NOT_JOURNALED", "message", "Secret auction bids are unavailable pending journaled settlement"));
    }
}
