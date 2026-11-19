package com.moneyverse.api.domain.stock.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(path = {
        "/api/v1/stocks/derivatives",
        "/api/stocks/derivatives",
        "/stocks/derivatives"
})
public class DerivativesController {

    private ResponseEntity<Map<String, Object>> unverifiedData() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "statusCode", 503,
                "code", "DERIVATIVES_DATA_UNVERIFIED",
                "message", "Verified derivatives market, positions and history are not available."
        ));
    }

    @GetMapping("/markets")
    public ResponseEntity<Map<String, Object>> listMarkets() {
        return unverifiedData();
    }

    @GetMapping("/positions")
    public ResponseEntity<Map<String, Object>> listMyPositions() {
        return unverifiedData();
    }

    @PostMapping("/open")
    public ResponseEntity<Map<String, Object>> openPosition(@RequestBody(required = false) Map<String, Object> body) {
        return unverifiedData();
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Map<String, Object>> closePosition(
            @PathVariable("id") String positionId,
            @RequestBody(required = false) Map<String, Object> body) {
        return unverifiedData();
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getTradeHistory() {
        return unverifiedData();
    }
}
