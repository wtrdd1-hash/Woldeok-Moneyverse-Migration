package com.moneyverse.api.domain.economy.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/quant",
        "/api/quant",
        "/quant"
})
public class QuantController {

    @GetMapping("/strategies")
    public ResponseEntity<Map<String, Object>> listStrategies() {
        List<Map<String, Object>> strategies = List.of(
                Map.of(
                        "id", "strat-golden-cross",
                        "name", "골든크로스 추세추종 모멘텀",
                        "description", "20일 이동평균선이 60일선을 상향 돌파 시 자동 분할 매수",
                        "status", "ACTIVE",
                        "cagrPct", 28.4,
                        "mddPct", -9.2,
                        "sharpeRatio", 1.85,
                        "winRatePct", 68.5,
                        "totalTrades", 142
                ),
                Map.of(
                        "id", "strat-bollinger-reversion",
                        "name", "볼린저 밴드 하단 평균회귀 (Mean Reversion)",
                        "description", "20일 볼린저밴드 -2표준편차 이탈 시 과매도 진입",
                        "status", "ACTIVE",
                        "cagrPct", 21.7,
                        "mddPct", -7.1,
                        "sharpeRatio", 1.92,
                        "winRatePct", 73.1,
                        "totalTrades", 98
                ),
                Map.of(
                        "id", "strat-deep-value",
                        "name", "저PBR/고배당 딥 밸류 팩터",
                        "description", "PER 10배 이하, PBR 0.8배 이하 가상 우량주 팩터 가중 포트폴리오",
                        "status", "ACTIVE",
                        "cagrPct", 18.9,
                        "mddPct", -5.4,
                        "sharpeRatio", 2.14,
                        "winRatePct", 78.0,
                        "totalTrades", 56
                )
        );
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", strategies.size(),
                "strategies", strategies
        ));
    }

    @PostMapping("/strategies")
    public ResponseEntity<Map<String, Object>> createStrategy(@RequestBody(required = false) Map<String, Object> body) {
        String id = "strat-custom-" + UUID.randomUUID().toString().substring(0, 8);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "strategyId", id,
                "status", "ACTIVE",
                "message", "새로운 퀀트 전략이 성공적으로 등록 및 가동되었습니다."
        ));
    }

    @PostMapping("/backtest")
    public ResponseEntity<Map<String, Object>> runBacktest(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "period", "3-Year Simulation",
                "cagrPct", 24.8,
                "mddPct", -8.5,
                "sharpeRatio", 1.82,
                "totalReturnPct", 94.3,
                "winRatePct", 71.4,
                "benchmarkCagrPct", 11.2,
                "alphaPct", 13.6
        ));
    }

    @PostMapping("/strategies/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleStrategy(
            @PathVariable("id") String strategyId,
            @RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "strategyId", strategyId,
                "status", "ACTIVE",
                "message", "전략 가동 상태가 정상적으로 토글되었습니다."
        ));
    }

    @GetMapping("/strategies/{id}/logs")
    public ResponseEntity<Map<String, Object>> getStrategyLogs(@PathVariable("id") String strategyId) {
        List<Map<String, Object>> logs = List.of(
                Map.of("timestamp", new Date().toInstant().toString(), "action", "BUY_SIGNAL", "symbol", "CHIMU314", "price", 68500, "qty", 10),
                Map.of("timestamp", new Date(System.currentTimeMillis() - 3600000).toInstant().toString(), "action", "HOLD", "symbol", "CHIPS", "price", 42000, "qty", 25)
        );
        return ResponseEntity.ok(Map.of(
                "success", true,
                "strategyId", strategyId,
                "logs", logs
        ));
    }
}
