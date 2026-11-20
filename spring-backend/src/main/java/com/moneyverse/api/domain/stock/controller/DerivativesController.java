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
        "/derivatives",
        "/api/v1/stocks/derivatives",
        "/stocks/derivatives"
})
public class DerivativesController {

    @GetMapping({"", "/overview", "/markets", "/positions"})
    public ResponseEntity<Map<String, Object>> getDerivativesOverview() {
        return ResponseEntity.status(503).body(Map.of("code", "DERIVATIVES_DATA_UNVERIFIED"));
    }
}
