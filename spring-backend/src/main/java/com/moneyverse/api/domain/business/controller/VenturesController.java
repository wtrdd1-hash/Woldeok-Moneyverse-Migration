package com.moneyverse.api.domain.business.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(path = {
        "/api/v1/businesses/ventures",
        "/api/businesses/ventures",
        "/businesses/ventures"
})
public class VenturesController {

    private ResponseEntity<Map<String, Object>> evidenceUnavailable() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "no-store");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .headers(headers)
                .body(Map.of(
                        "statusCode", 503,
                        "code", "VENTURE_EVIDENCE_UNAVAILABLE",
                        "message", "Verified venture funding and owner-scoped equity ledger receipts are unavailable."
                ));
    }

    private ResponseEntity<Map<String, Object>> simulationNotSupported() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "statusCode", 503,
                "message", "시뮬레이션 기능입니다. 실제 자금 정산 및 상태 변경은 지원되지 않습니다."
        ));
    }

    @GetMapping("/pitches")
    public ResponseEntity<Map<String, Object>> listPitches() {
        return evidenceUnavailable();
    }

    @GetMapping("/investments")
    public ResponseEntity<Map<String, Object>> listMyInvestments() {
        return evidenceUnavailable();
    }

    @PostMapping("/invest")
    public ResponseEntity<Map<String, Object>> investVenture(@RequestBody(required = false) Map<String, Object> body) {
        return simulationNotSupported();
    }

    @PostMapping("/claim-dividend")
    public ResponseEntity<Map<String, Object>> claimDividend(@RequestBody(required = false) Map<String, Object> body) {
        return simulationNotSupported();
    }

    @PostMapping("/apply-founder")
    public ResponseEntity<Map<String, Object>> applyFounderPitch(@RequestBody(required = false) Map<String, Object> body) {
        return simulationNotSupported();
    }
}
