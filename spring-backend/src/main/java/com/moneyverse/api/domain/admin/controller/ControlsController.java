package com.moneyverse.api.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/controls",
        "/api/controls",
        "/controls",
        "/api/v1/admin/controls/public",
        "/api/admin/controls/public"
})
public class ControlsController {

    @GetMapping("/flags")
    public ResponseEntity<Map<String, Object>> getPublicFlags() {
        Map<String, Object> flags = new LinkedHashMap<>();
        flags.put("PVP_ARENA_ENABLED", true);
        flags.put("STOCK_LEAGUE_ENABLED", true);
        flags.put("QUANT_STRATEGIES_ACTIVE", false);
        flags.put("VENTURES_INVESTMENT_ACTIVE", false);
        flags.put("HOT_TIME_ACTIVE", true);
        flags.put("BURN_EVENT_ACTIVE", true);
        return ResponseEntity.ok(Map.of("flags", flags));
    }

    @GetMapping("/kill-switches")
    public ResponseEntity<Map<String, Object>> getKillSwitches() {
        Map<String, Object> switches = new LinkedHashMap<>();
        switches.put("ALL_TRANSFERS_BLOCKED", false);
        switches.put("CASINO_GAMES_BLOCKED", false);
        switches.put("STOCK_TRADING_HALTED", false);
        switches.put("BOND_PURCHASE_HALTED", false);
        return ResponseEntity.ok(Map.of("switches", switches));
    }
}
