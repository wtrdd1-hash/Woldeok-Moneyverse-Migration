package com.moneyverse.api.domain.business.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/businesses/ventures",
        "/api/businesses/ventures",
        "/businesses/ventures"
})
public class VenturesController {

    @GetMapping("/pitches")
    public ResponseEntity<Map<String, Object>> listPitches() {
        return ResponseEntity.status(503).body(Map.of("code", "VENTURE_EVIDENCE_UNAVAILABLE"));
    }

    @GetMapping("/investments")
    public ResponseEntity<Map<String, Object>> listMyInvestments() {
        return ResponseEntity.status(503).body(Map.of("code", "VENTURE_EVIDENCE_UNAVAILABLE"));
    }

    @PostMapping("/invest")
    public ResponseEntity<Map<String, Object>> investVenture(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.status(503).body(Map.of("code", "VENTURE_EVIDENCE_UNAVAILABLE"));
    }

    @PostMapping("/claim-dividend")
    public ResponseEntity<Map<String, Object>> claimDividend(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.status(503).body(Map.of("code", "VENTURE_EVIDENCE_UNAVAILABLE"));
    }

    @PostMapping("/apply-founder")
    public ResponseEntity<Map<String, Object>> applyFounderPitch(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.status(503).body(Map.of("code", "VENTURE_EVIDENCE_UNAVAILABLE"));
    }
}
