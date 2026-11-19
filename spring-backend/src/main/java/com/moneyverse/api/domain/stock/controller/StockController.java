package com.moneyverse.api.domain.stock.controller;

import com.moneyverse.api.domain.stock.dto.StockDtos.*;
import com.moneyverse.api.domain.stock.service.StockService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.*;

@Tag(name = "Stock Market", description = "가상 주식 시장 시세, 차트 캔들, 주문 체결 및 포트폴리오 API")
@RestController
public class StockController {

    private static final Logger log = LoggerFactory.getLogger(StockController.class);
    private static final Set<Integer> ALLOWED_CANDLE_INTERVALS = Set.of(60, 300, 1800, 3600, 7200, 14400, 86400, 604800);

    private final StockService stockService;
    private final MemberApiGuard memberApiGuard;

    public StockController(StockService stockService, MemberApiGuard memberApiGuard) {
        this.stockService = stockService;
        this.memberApiGuard = memberApiGuard;
    }

    private UUID resolveUserId(HttpServletRequest request, String ignoredHeaderUserId) {
        return memberApiGuard.actor(request);
    }

    @Operation(summary = "상장 종목 전체 시세 및 당일 등락 개요")
    @GetMapping(path = { "/api/v1/stocks", "/api/stocks" })
    public ResponseEntity<StockMarketOverviewResponse> list() {
        List<StockMarketRow> stocks = stockService.list();
        return ResponseEntity.ok(new StockMarketOverviewResponse(stocks));
    }

    @Operation(summary = "유저 관심 종목 목록")
    @GetMapping(path = { "/api/v1/stocks/watchlist", "/api/stocks/watchlist" })
    public ResponseEntity<WatchlistResponse> watchlist(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        UUID userId = resolveUserId(request, headerUserId);
        List<StockWatchlistRow> stocks = stockService.watchlist(userId);
        return ResponseEntity.ok(new WatchlistResponse(stocks));
    }

    @Operation(summary = "관심 종목 추가/제거 토글")
    @PostMapping(path = { "/api/v1/stocks/{id}/watchlist", "/api/stocks/{id}/watchlist" })
    public ResponseEntity<WatchlistToggleResponse> setWatchlist(
            HttpServletRequest request,
            @PathVariable("id") String stockIdStr,
            @RequestBody WatchlistRequest body,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        UUID userId = memberApiGuard.verifiedMutationActor(request);
        UUID stockId = UUID.fromString(stockIdStr);
        boolean watching = stockService.setWatchlist(userId, stockId, body.isWatching());
        return ResponseEntity.ok(new WatchlistToggleResponse(watching));
    }

    @Operation(summary = "유저 보유 주식 포트폴리오")
    @GetMapping(path = { "/api/v1/stocks/portfolio", "/api/stocks/portfolio" })
    public ResponseEntity<PortfolioResponse> portfolio(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        UUID userId = resolveUserId(request, headerUserId);
        List<StockPortfolioRow> holdings = stockService.portfolio(userId);
        return ResponseEntity.ok(new PortfolioResponse(holdings));
    }

    @Operation(summary = "거래정지 정산 영수증")
    @GetMapping(path = { "/api/v1/stocks/halt-receipts", "/api/stocks/halt-receipts" })
    public ResponseEntity<HaltReceiptsResponse> haltReceipts(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        UUID userId = resolveUserId(request, headerUserId);
        List<StockHaltSettlementReceiptRow> receipts = stockService.haltSettlementReceipts(userId);
        return ResponseEntity.ok(new HaltReceiptsResponse(receipts));
    }

    @Operation(summary = "유저 주식 거래 내역")
    @GetMapping(path = { "/api/v1/stocks/history", "/api/stocks/history" })
    public ResponseEntity<?> history(
            HttpServletRequest request,
            @RequestParam(value = "limit", required = false, defaultValue = "50") String limitStr,
            @RequestParam(value = "minGross", required = false) String minGross,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        UUID userId = resolveUserId(request, headerUserId);

        int limit = 50;
        try {
            limit = Integer.parseInt(limitStr);
            if (limit != 50 && limit != 100 && limit != 200) {
                limit = 50;
            }
        } catch (NumberFormatException ignored) {}

        List<StockHistoryRow> trades = stockService.history(userId, limit);

        if (minGross != null && !minGross.isBlank()) {
            try {
                BigInteger min = new BigInteger(minGross);
                trades = trades.stream()
                        .filter(t -> {
                            try {
                                return new BigInteger(t.getGrossAmount()).compareTo(min) >= 0;
                            } catch (Exception e) {
                                return true;
                            }
                        })
                        .toList();
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(new TradeHistoryResponse(trades));
    }

    @Operation(summary = "전 종목 최근 시세 스파크라인 일괄 조회")
    @GetMapping(path = { "/api/v1/stocks/sparklines", "/api/stocks/sparklines" })
    public ResponseEntity<SparklinesResponse> sparklines(
            @RequestParam(value = "limit", required = false, defaultValue = "60") int limit) {
        int bounded = Math.min(240, Math.max(1, limit));
        List<StockSparkSeriesRow> series = stockService.sparkSeries(bounded);
        return ResponseEntity.ok(new SparklinesResponse(series));
    }

    @Operation(summary = "현재 시장 활성 이벤트 조회")
    @GetMapping(path = { "/api/v1/stocks/market-events", "/api/stocks/market-events" })
    public ResponseEntity<MarketEventsResponse> marketEvents() {
        List<StockMarketEventRow> events = stockService.marketEvents();
        return ResponseEntity.ok(new MarketEventsResponse(events));
    }

    @Operation(summary = "단일 종목 가격 이력 조회")
    @GetMapping(path = { "/api/v1/stocks/{id}/prices", "/api/stocks/{id}/prices" })
    public ResponseEntity<PriceHistoryResponse> prices(
            @PathVariable("id") String stockIdStr,
            @RequestParam(value = "limit", required = false, defaultValue = "80") int limit) {
        UUID stockId = UUID.fromString(stockIdStr);
        int bounded = Math.min(240, Math.max(1, limit));
        List<StockPriceHistoryRow> prices = stockService.priceHistory(stockId, bounded);
        return ResponseEntity.ok(new PriceHistoryResponse(prices));
    }

    @Operation(summary = "단일 종목 캔들 차트 및 가격 범위 조회")
    @GetMapping(path = { "/api/v1/stocks/{id}/candles", "/api/stocks/{id}/candles" })
    public ResponseEntity<?> candles(
            @PathVariable("id") String stockIdStr,
            @RequestParam(value = "interval", required = false, defaultValue = "86400") int interval,
            @RequestParam(value = "limit", required = false, defaultValue = "120") int limit) {
        if (!ALLOWED_CANDLE_INTERVALS.contains(interval)) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("type", "about:blank");
            err.put("title", "Bad Request");
            err.put("status", 400);
            err.put("detail", "unsupported candle interval");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        UUID stockId = UUID.fromString(stockIdStr);
        int bounded = Math.min(400, Math.max(1, limit));

        List<StockCandleRow> candleRows = stockService.candles(stockId, interval, bounded);
        StockRangeRow range = stockService.priceRange(stockId);

        return ResponseEntity.ok(new CandlesResponse(interval, candleRows, range));
    }

    @Operation(summary = "주식 매수/매도 주문 체결")
    @PostMapping(path = { "/api/v1/stocks/{id}/orders", "/api/stocks/{id}/orders" })
    public ResponseEntity<?> order(
            HttpServletRequest request,
            @PathVariable("id") String stockIdStr,
            @Valid @RequestBody OrderRequest body,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        // Reject caller-supplied identity before entering exception handlers.
        UUID userId = memberApiGuard.verifiedMutationActor(request);
        try {
            UUID stockId = UUID.fromString(stockIdStr);
            UUID idempotencyKey = UUID.fromString(body.getIdempotencyKey());

            TradeResultResponse result = stockService.trade(
                    userId, stockId, body.getSide(), body.getQuantity(), idempotencyKey
            );
            return ResponseEntity.ok(result);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (IllegalStateException e) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("type", "about:blank");
            err.put("title", "Bad Request");
            err.put("status", 400);
            err.put("detail", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        } catch (Exception e) {
            log.warn("Stock order failed without a certified receipt");
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("type", "about:blank");
            err.put("title", "Service Unavailable");
            err.put("status", 503);
            err.put("detail", "STOCK_ORDER_SOURCE_UNAVAILABLE");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(err);
        }
    }
}
