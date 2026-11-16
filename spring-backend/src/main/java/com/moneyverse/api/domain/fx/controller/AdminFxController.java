package com.moneyverse.api.domain.fx.controller;

import com.moneyverse.api.domain.fx.service.FxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(path = {
        "/api/v1/admin/fx",
        "/api/admin/fx",
        "/admin/fx"
})
public class AdminFxController {

    private final FxService fxService;

    @Autowired
    public AdminFxController(FxService fxService) {
        this.fxService = fxService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "reserves", fxService.getReserveStatus(),
                        "history", fxService.getRateHistory(30),
                        "txs", fxService.listTransactions(15),
                        "sdrAllocations", fxService.getSdrAllocations(),
                        "swapAgreements", fxService.getSwapAgreements(),
                        "forwardContracts", fxService.listAllForwardContracts(20),
                        "ews", fxService.getEarlyWarningStatus()
                )
        ));
    }

    @PostMapping("/intervene")
    public ResponseEntity<Map<String, Object>> intervene(@RequestBody(required = false) Map<String, Object> body) {
        fxService.guardFinancialOperations();
        return null;
    }

    @PostMapping("/swaps/drawdown")
    public ResponseEntity<Map<String, Object>> drawdownSwap(@RequestBody(required = false) Map<String, Object> body) {
        fxService.guardFinancialOperations();
        return null;
    }

    @PostMapping("/forward/settle")
    public ResponseEntity<Map<String, Object>> settleForward(@RequestBody(required = false) Map<String, Object> body) {
        fxService.guardFinancialOperations();
        return null;
    }

    @PostMapping("/halt")
    public ResponseEntity<Map<String, Object>> toggleHalt(@RequestBody(required = false) Map<String, Object> body) {
        fxService.guardFinancialOperations();
        return null;
    }
}
