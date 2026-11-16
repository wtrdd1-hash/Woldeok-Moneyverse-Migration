package com.moneyverse.api.domain.fx.controller;

import com.moneyverse.api.domain.fx.service.FxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping(path = {
        "/api/v1/fx",
        "/api/fx",
        "/fx"
})
public class PublicFxController {

    private final FxService fxService;

    @Autowired
    public PublicFxController(FxService fxService) {
        this.fxService = fxService;
    }

    private ResponseEntity<Map<String, Object>> sourceUnverified() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "no-store");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .headers(headers)
                .body(Map.of(
                        "statusCode", 503,
                        "message", "fx_source_unverified"
                ));
    }

    @GetMapping("/portal")
    public ResponseEntity<Map<String, Object>> getPublicPortalData() {
        return sourceUnverified();
    }

    @GetMapping("/my-wallet")
    public ResponseEntity<Map<String, Object>> getMyWallet() {
        fxService.guardFinancialOperations();
        return null;
    }

    @GetMapping("/forward/rates")
    public ResponseEntity<Map<String, Object>> getForwardRates() {
        return sourceUnverified();
    }

    @GetMapping("/forward/my-contracts")
    public ResponseEntity<Map<String, Object>> getMyForwardContracts() {
        fxService.guardFinancialOperations();
        return null;
    }

    @PostMapping("/forward/contract")
    public ResponseEntity<Map<String, Object>> createForwardContract(@RequestBody(required = false) Map<String, Object> body) {
        fxService.guardFinancialOperations();
        return null;
    }

    @PostMapping("/swap/wld-to-usd")
    public ResponseEntity<Map<String, Object>> swapWldToUsd(@RequestBody(required = false) Map<String, Object> body) {
        fxService.guardFinancialOperations();
        return null;
    }

    @PostMapping("/swap/usd-to-wld")
    public ResponseEntity<Map<String, Object>> swapUsdToWld(@RequestBody(required = false) Map<String, Object> body) {
        fxService.guardFinancialOperations();
        return null;
    }
}
