package com.moneyverse.api.domain.stock.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/derivatives",
        "/api/derivatives",
        "/derivatives"
})
public class DerivativesController {

    @GetMapping({"", "/overview"})
    public ResponseEntity<Map<String, Object>> getDerivativesOverview() {
        List<Map<String, Object>> contracts = List.of(
                Map.of("symbol", "WLD-FUT-2612", "underlying", "WLD Index", "strikePrice", 1000, "currentPrice", 1042, "openInterest", 15400, "status", "TRADING"),
                Map.of("symbol", "CHIMU-CALL-70K", "underlying", "CHIMU314", "strikePrice", 70000, "currentPrice", 2350, "openInterest", 8200, "status", "TRADING")
        );
        return ResponseEntity.ok(Map.of(
                "success", true,
                "marketStatus", "OPEN",
                "contracts", contracts
        ));
    }
}
