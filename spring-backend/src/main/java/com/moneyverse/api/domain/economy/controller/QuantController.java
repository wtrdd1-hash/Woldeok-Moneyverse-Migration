package com.moneyverse.api.domain.economy.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(path = {
        "/api/v1/quant",
        "/api/quant",
        "/quant"
})
public class QuantController {

    private ResponseEntity<Map<String, Object>> unverifiedEvidence() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "no-store");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .headers(headers)
                .body(Map.of(
                        "statusCode", 503,
                        "code", "QUANT_EVIDENCE_UNAVAILABLE",
                        "message", "검증된 전략·거래 실행·시장 시세 근거가 없어 금융 성과를 제공할 수 없습니다."
                ));
    }

    private ResponseEntity<Map<String, Object>> simulationNotSupported() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "statusCode", 503,
                "message", "시뮬레이션 기능입니다. 실제 자금 정산 및 상태 변경은 지원되지 않습니다."
        ));
    }

    @GetMapping("/strategies")
    public ResponseEntity<Map<String, Object>> listStrategies() {
        return unverifiedEvidence();
    }

    @PostMapping("/strategies")
    public ResponseEntity<Map<String, Object>> createStrategy(@RequestBody(required = false) Map<String, Object> body) {
        return simulationNotSupported();
    }

    @PostMapping("/backtest")
    public ResponseEntity<Map<String, Object>> runBacktest(@RequestBody(required = false) Map<String, Object> body) {
        return unverifiedEvidence();
    }

    @PostMapping("/strategies/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleStrategy(
            @PathVariable("id") String strategyId,
            @RequestBody(required = false) Map<String, Object> body) {
        return simulationNotSupported();
    }

    @GetMapping("/strategies/{id}/logs")
    public ResponseEntity<Map<String, Object>> getStrategyLogs(@PathVariable("id") String strategyId) {
        return unverifiedEvidence();
    }
}
