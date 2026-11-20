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
        return ResponseEntity.status(503).body(Map.of("code", "QUANT_EVIDENCE_UNAVAILABLE"));
    }

    @PostMapping("/strategies")
    public ResponseEntity<Map<String, Object>> createStrategy(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.status(503).body(Map.of("code", "QUANT_EVIDENCE_UNAVAILABLE"));
    }

    @PostMapping("/backtest")
    public ResponseEntity<Map<String, Object>> runBacktest(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.status(503).body(Map.of("code", "QUANT_EVIDENCE_UNAVAILABLE"));
    }

    @PostMapping("/strategies/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleStrategy(
            @PathVariable("id") String strategyId,
            @RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.status(503).body(Map.of("code", "QUANT_EVIDENCE_UNAVAILABLE"));
    }

    @GetMapping("/strategies/{id}/logs")
    public ResponseEntity<Map<String, Object>> getStrategyLogs(@PathVariable("id") String strategyId) {
        return ResponseEntity.status(503).body(Map.of("code", "QUANT_EVIDENCE_UNAVAILABLE"));
    }
}
