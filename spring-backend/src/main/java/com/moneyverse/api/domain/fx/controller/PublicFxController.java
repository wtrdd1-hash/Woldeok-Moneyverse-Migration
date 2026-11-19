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
        return ResponseEntity.ok(Map.of(
                "success", true,
                "reserve", fxService.getReserveStatus(),
                "rateHistory", fxService.getRateHistory(14),
                "sdrAllocations", fxService.getSdrAllocations(),
                "currentUsdKrw", 1382.4,
                "marketStatus", "OPEN"
        ));
    }

    @GetMapping("/my-wallet")
    public ResponseEntity<Map<String, Object>> getMyFxWallet() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "usdBalance", 540.0,
                "krwEquivalent", 746496L,
                "avgExchangeRate", 1345.5,
                "unrealizedGainPct", 2.74
        ));
    }

    @GetMapping("/forward/rates")
    public ResponseEntity<Map<String, Object>> getForwardRates() {
        List<Map<String, Object>> rates = List.of(
                Map.of("tenor", "1M", "forwardRate", 1380.2, "swapPoint", -2.2, "annualizedPct", -1.9),
                Map.of("tenor", "3M", "forwardRate", 1376.5, "swapPoint", -5.9, "annualizedPct", -1.7),
                Map.of("tenor", "6M", "forwardRate", 1370.8, "swapPoint", -11.6, "annualizedPct", -1.68),
                Map.of("tenor", "1Y", "forwardRate", 1362.0, "swapPoint", -20.4, "annualizedPct", -1.47)
        );
        return ResponseEntity.ok(Map.of(
                "success", true,
                "spotRate", 1382.4,
                "rates", rates
        ));
    }

    @GetMapping("/forward/my-contracts")
    public ResponseEntity<Map<String, Object>> getMyForwardContracts() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "contracts", List.of()
        ));
    }
}
