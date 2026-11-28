package com.moneyverse.api.domain.stock.controller;

import com.moneyverse.api.domain.stock.dto.NewspaperDtos.*;
import com.moneyverse.api.domain.stock.dto.StockDtos.StockMarketEventRow;
import com.moneyverse.api.domain.stock.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

@Tag(name = "Newspaper", description = "가상 경제 신문사 펄스 및 시장 심리 지표 API")
@RestController
public class NewspaperController {

    private final StockService stockService;

    public NewspaperController(StockService stockService) {
        this.stockService = stockService;
    }

    @Operation(summary = "주간 경제 보고서 (검증된 지표 제공 전까지 가드)")
    @GetMapping(path = { "/api/v1/newspaper/weekly-brief", "/api/newspaper/weekly-brief" })
    public ResponseEntity<?> getWeeklyBrief() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("code", "NEWSPAPER_WEEKLY_BRIEF_UNVERIFIED"));
    }

    @Operation(summary = "진행 중인 가상시장 이벤트에 근거한 현재 시장 심리 조회")
    @GetMapping(path = { "/api/v1/newspaper/pulse", "/api/newspaper/pulse" })
    public ResponseEntity<NewspaperPulseResponse> getMarketPulse() {
        List<StockMarketEventRow> events = stockService.marketEvents();

        int score = 50; // 기본 중립
        String label = "NEUTRAL";
        String leadHeadline = "월덱 가상 주식 시장 평온 유지";
        String leadSummary = "현재 시장에 특별한 외부 충격 이벤트가 없어 잔잔한 거래 흐름을 유지하고 있습니다.";

        if (!events.isEmpty()) {
            int netScore = 50;
            for (StockMarketEventRow e : events) {
                int delta = "up".equalsIgnoreCase(e.getDirection()) ? e.getStrength() * 5 : -e.getStrength() * 5;
                netScore += delta;
            }
            score = Math.max(5, Math.min(95, netScore));

            if (score >= 80) label = "VERY_BULLISH";
            else if (score >= 60) label = "BULLISH";
            else if (score <= 20) label = "VERY_BEARISH";
            else if (score <= 40) label = "BEARISH";
            else label = "NEUTRAL";

            StockMarketEventRow first = events.get(0);
            leadHeadline = first.getHeadline();
            leadSummary = first.getBody() != null ? first.getBody() : first.getHeadline();
        }

        NewspaperPulseData data = new NewspaperPulseData(
                score, label, events.size(), leadHeadline, leadSummary, Instant.now().toString()
        );

        return ResponseEntity.ok(new NewspaperPulseResponse(true, data));
    }

    @Operation(summary = "독자 여론조사 현황 조회")
    @GetMapping(path = { "/api/v1/newspaper/poll", "/api/newspaper/poll" })
    public ResponseEntity<NewspaperPollData> getPoll() {
        // Security review 2026-11-28: results were seeded with invented counts and kept only in
        // memory (reset on restart, unauthenticated votes). No stored poll exists, so say so.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "NEWSPAPER_POLL_SOURCE_UNAVAILABLE");
    }

    @Operation(summary = "독자 여론조사 투표 참여")
    @PostMapping(path = { "/api/v1/newspaper/poll/vote", "/api/newspaper/poll/vote" })
    public ResponseEntity<?> vote(@RequestBody(required = false) PollVoteRequest body) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "NEWSPAPER_POLL_SOURCE_UNAVAILABLE");
    }

    @Operation(summary = "금융 경제 상식 로어 카탈로그 조회")
    @GetMapping(path = { "/api/v1/newspaper/lore", "/api/newspaper/lore" })
    public ResponseEntity<List<FinancialLoreItem>> getLore() {
        List<FinancialLoreItem> lore = List.of(
                new FinancialLoreItem("lore-1", "통화 정책", "복식부기 원장과 화폐 순환", "월덕 머니버스의 모든 자금은 대차 균형을 이루는 복식부기 원장에 의해 발행되고 소각됩니다.", 3),
                new FinancialLoreItem("lore-2", "투자 전략", "서킷브레이커와 주식 거래 정지", "단기 변동성이 과열될 경우 투자자 보호를 위해 가상 주식 거래 정지가 발동될 수 있습니다.", 4),
                new FinancialLoreItem("lore-3", "국고 거버넌스", "국부펀드 ASWF의 환원 모델", "카지노와 주식 거래에서 발생하는 피구세는 국고로 환수되어 전 국민 복지 기금으로 환원됩니다.", 5)
        );
        return ResponseEntity.ok(lore);
    }

}
