package com.moneyverse.api.domain.content.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/content",
        "/api/content",
        "/content",
        "/api/v1/announcements",
        "/api/announcements",
        "/announcements"
})
public class AppContentController {

    @GetMapping(path = {"", "/", "/announcements"})
    public ResponseEntity<Map<String, Object>> announcements() {
        return ResponseEntity.ok(Map.of(
                "announcements", List.of(
                        Map.of(
                                "id", "ann-01",
                                "title", "제1회 월덱 가상주식 챔피언십 리그 개최 안내",
                                "createdAt", new Date().toInstant().toString(),
                                "isPinned", true
                        )
                )
        ));
    }

    @GetMapping("/photos")
    public ResponseEntity<Map<String, Object>> photos() {
        return ResponseEntity.ok(Map.of(
                "photos", Collections.emptyList()
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "status", Map.of(
                        "systemOperational", true,
                        "tradingEngine", "ONLINE",
                        "bankingEngine", "ONLINE",
                        "checkedAt", new Date().toInstant().toString()
                )
        ));
    }
}
