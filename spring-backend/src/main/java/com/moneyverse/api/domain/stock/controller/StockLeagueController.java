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

@Tag(name = "Stock Championship League", description = "가상 주식 챔피언십 리그 및 고래 트레이더 리더보드 API")
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

    @Operation(summary = "현재 진행 중인 주식 챔피언십 리그 현황 및 리더보드, 고래 트레이더 목록 조회")
    @GetMapping(path = { "/api/v1/stocks/league/current", "/api/stocks/league/current" })
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

    @Operation(summary = "주식 챔피언십 리그 참가 신청")
    @PostMapping(path = { "/api/v1/stocks/league/join", "/api/stocks/league/join" })
    public ResponseEntity<?> joinLeague(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        try {
            UUID userId = resolveUserId(request, headerUserId);
            String userName = "트레이더";
            StockLeagueParticipantDto participation = leagueService.joinSeason(userId, userName);

            return ResponseEntity.ok(new JoinLeagueResponse(
                    true, participation, "제1회 월덱 가상주식 챔피언십 리그에 성공적으로 참가 등록되었습니다!"
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
            err.put("detail", "리그 참가 신청 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @Operation(summary = "고래 트레이더 카피 트레이딩 구독 신청 (원장 보호 가드)")
    @PostMapping(path = { "/api/v1/stocks/league/copy-trade/subscribe", "/api/stocks/league/copy-trade/subscribe" })
    public ResponseEntity<?> subscribeCopyTrading(@RequestBody SubscribeCopyTradingRequest request) {
        // Node.js 계약과 동일하게 복식부기 원장 정산 증빙 완결 전까지 안전 보호 에러 반환
        Map<String, Object> err = new LinkedHashMap<>();
        err.put("type", "about:blank");
        err.put("title", "Service Unavailable");
        err.put("status", 503);
        err.put("code", "STOCK_LEAGUE_COPY_TRADING_UNAVAILABLE");
        err.put("detail", "Copy-trading subscription is unavailable until ledger-backed settlement is implemented.");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(err);
    }

    @Operation(summary = "카피 트레이딩 구독 취소")
    @PostMapping(path = { "/api/v1/stocks/league/copy-trade/cancel", "/api/stocks/league/copy-trade/cancel" })
    public ResponseEntity<?> cancelCopyTrading(
            HttpServletRequest request,
            @RequestBody CancelCopyTradingRequest body,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        UUID userId = resolveUserId(request, headerUserId);
        boolean cancelled = leagueService.cancelCopyTrading(userId, body.getWhaleId());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("cancelled", cancelled);
        res.put("message", cancelled ? "카피 트레이딩 구독이 성공적으로 취소되었습니다." : "취소할 활성 구독 내역이 없습니다.");
        return ResponseEntity.ok(res);
    }
}
