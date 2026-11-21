package com.moneyverse.api.domain.fx.controller;

import com.moneyverse.api.domain.fx.service.FxService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/fx",
        "/api/fx",
        "/fx"
})
public class PublicFxController {

    private final FxService fxService;

    public PublicFxController(FxService fxService) {
        this.fxService = fxService;
    }

    @GetMapping("/portal")
    public ResponseEntity<Map<String, Object>> getPublicPortalData() {
        return ResponseEntity.status(503).body(Map.of("message", "fx_source_unverified"));
    }

    @GetMapping("/my-wallet")
    public ResponseEntity<Map<String, Object>> getMyFxWallet() {
        return ResponseEntity.status(503).body(Map.of("message", "fx_source_unverified"));
    }

    @GetMapping("/forward/rates")
    public ResponseEntity<Map<String, Object>> getForwardRates() {
        return ResponseEntity.status(503).body(Map.of("message", "fx_source_unverified"));
    }

    @GetMapping("/forward/my-contracts")
    public ResponseEntity<Map<String, Object>> getMyForwardContracts() {
        return ResponseEntity.status(503).body(Map.of("message", "fx_source_unverified"));
    }
}
