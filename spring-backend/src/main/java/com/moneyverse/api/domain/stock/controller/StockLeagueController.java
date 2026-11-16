package com.moneyverse.api.domain.stock.controller;

import com.moneyverse.api.domain.stock.dto.StockLeagueDtos.*;
import com.moneyverse.api.domain.stock.service.StockLeagueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Tag(name = "Stock Championship League", description = "媛??二쇱떇 梨뷀뵾?몄떗 由ш렇 諛?怨좊옒 ?몃젅?대뜑 由щ뜑蹂대뱶 API")
@RestController
public class StockLeagueController {

    private static final Logger log = LoggerFactory.getLogger(StockLeagueController.class);
    private static final UUID DEFAULT_FALLBACK_USER = UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20");

    private final StockLeagueService leagueService;

    public StockLeagueController(StockLeagueService leagueService) {
        this.leagueService = leagueService;
    }

    private UUID resolveUserId(HttpServletRequest request, String headerUserId) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                return UUID.fromString(headerUserId.trim());
            } catch (Exception ignored) {}
        }
        return DEFAULT_FALLBACK_USER;
    }

    @Operation(summary = "?꾩옱 吏꾪뻾 以묒씤 二쇱떇 梨뷀뵾?몄떗 由ш렇 ?꾪솴 諛?由щ뜑蹂대뱶, 怨좊옒 ?몃젅?대뜑 紐⑸줉 議고쉶")
    @GetMapping(path = { "/api/v1/stocks/league/current", "/api/stocks/league/current", "/stocks/league/current" })
    public ResponseEntity<CurrentLeagueResponse> getCurrentLeague(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        StockLeagueSeasonDto currentSeason = leagueService.getCurrentSeason();
        if (currentSeason == null) {
            return ResponseEntity.ok(new CurrentLeagueResponse(
                    true, null, Collections.emptyList(), Collections.emptyList(), null, Collections.emptyList()
            ));
        }

        List<StockLeagueParticipantDto> leaderboard = leagueService.getLeaderboard(currentSeason.getId(), 20);
        List<StockLeagueParticipantDto> whales = leagueService.getWhales(10);

        UUID currentUserId = resolveUserId(request, headerUserId);
        StockLeagueParticipantDto myParticipation = leagueService.getMyParticipation(currentSeason.getId(), currentUserId);
        List<CopyTradingSubscriptionDto> mySubscriptions = leagueService.getMySubscriptions(currentUserId);

        return ResponseEntity.ok(new CurrentLeagueResponse(
                true, currentSeason, leaderboard, whales, myParticipation, mySubscriptions
        ));
    }

    @Operation(summary = "二쇱떇 梨뷀뵾?몄떗 由ш렇 李멸? ?좎껌")
    @PostMapping(path = { "/api/v1/stocks/league/join", "/api/stocks/league/join", "/stocks/league/join" })
    public ResponseEntity<?> joinLeague(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        try {
            UUID userId = resolveUserId(request, headerUserId);
            String userName = "?몃젅?대뜑";
            StockLeagueParticipantDto participation = leagueService.joinSeason(userId, userName);

            return ResponseEntity.ok(new JoinLeagueResponse(
                    true, participation, "?????붾뜳 媛?곸＜??梨뷀뵾?몄떗 由ш렇???깃났?곸쑝濡?李멸? ?깅줉?섏뿀?듬땲??"
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("type", "about:blank");
            err.put("title", "Bad Request");
            err.put("status", 400);
            err.put("detail", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        } catch (Exception e) {
            log.error("Stock league join error: {}", e.getMessage(), e);
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("type", "about:blank");
            err.put("title", "Internal Server Error");
            err.put("status", 500);
            err.put("detail", "由ш렇 李멸? ?좎껌 泥섎━ 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @Operation(summary = "怨좊옒 ?몃젅?대뜑 移댄뵾 ?몃젅?대뵫 援щ룆 ?좎껌 (?먯옣 蹂댄샇 媛??")
    @PostMapping(path = { "/api/v1/stocks/league/copy-trade/subscribe", "/api/stocks/league/copy-trade/subscribe", "/stocks/league/copy-trade/subscribe" })
    public ResponseEntity<?> subscribeCopyTrading(@RequestBody SubscribeCopyTradingRequest request) {
        // Node.js 怨꾩빟怨??숈씪?섍쾶 蹂듭떇遺湲??먯옣 ?뺤궛 利앸튃 ?꾧껐 ?꾧퉴吏 ?덉쟾 蹂댄샇 ?먮윭 諛섑솚
        Map<String, Object> err = new LinkedHashMap<>();
        err.put("type", "about:blank");
        err.put("title", "Service Unavailable");
        err.put("status", 503);
        err.put("code", "STOCK_LEAGUE_COPY_TRADING_UNAVAILABLE");
        err.put("detail", "Copy-trading subscription is unavailable until ledger-backed settlement is implemented.");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(err);
    }

    @Operation(summary = "移댄뵾 ?몃젅?대뵫 援щ룆 痍⑥냼")
    @PostMapping(path = { "/api/v1/stocks/league/copy-trade/cancel", "/api/stocks/league/copy-trade/cancel", "/stocks/league/copy-trade/cancel" })
    public ResponseEntity<?> cancelCopyTrading(
            HttpServletRequest request,
            @RequestBody CancelCopyTradingRequest body,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        UUID userId = resolveUserId(request, headerUserId);
        boolean cancelled = leagueService.cancelCopyTrading(userId, body.getWhaleId());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("cancelled", cancelled);
        res.put("message", cancelled ? "移댄뵾 ?몃젅?대뵫 援щ룆???깃났?곸쑝濡?痍⑥냼?섏뿀?듬땲??" : "痍⑥냼???쒖꽦 援щ룆 ?댁뿭???놁뒿?덈떎.");
        return ResponseEntity.ok(res);
    }
}

