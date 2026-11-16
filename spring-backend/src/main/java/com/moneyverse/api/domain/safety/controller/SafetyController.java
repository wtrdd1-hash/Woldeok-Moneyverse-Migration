package com.moneyverse.api.domain.safety.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1",
        "/api",
        ""
})
public class SafetyController {

    @PostMapping("/safety/takedown")
    public ResponseEntity<Map<String, Object>> submitEmergencyTakedown(@RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("caseId", "case-" + UUID.randomUUID());
        res.put("status", "RECEIVED");
        res.put("submittedAt", new Date().toInstant().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/safety/takedown/status")
    public ResponseEntity<Map<String, Object>> getTakedownStatus(@RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("caseId", body != null ? body.get("caseId") : null);
        res.put("status", "IN_REVIEW");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/admin/safety/takedowns")
    public ResponseEntity<Map<String, Object>> adminListTakedowns(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "limit", required = false, defaultValue = "50") int limit,
            @RequestParam(name = "offset", required = false, defaultValue = "0") int offset) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "takedowns", Collections.emptyList(),
                "total", 0
        ));
    }

    @PostMapping("/admin/safety/takedowns/{caseId}/action")
    public ResponseEntity<Map<String, Object>> adminActionTakedown(
            @PathVariable("caseId") String caseId,
            @RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "caseId", caseId,
                "action", body != null ? body.getOrDefault("action", "RESOLVE") : "RESOLVE",
                "processedAt", new Date().toInstant().toString()
        ));
    }

    @GetMapping("/admin/safety/chat-reports")
    public ResponseEntity<Map<String, Object>> adminListChatReports(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "limit", required = false, defaultValue = "50") int limit,
            @RequestParam(name = "offset", required = false, defaultValue = "0") int offset) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "reports", Collections.emptyList(),
                "total", 0
        ));
    }

    @GetMapping("/admin/safety/chat-reports/{id}")
    public ResponseEntity<Map<String, Object>> adminGetChatReport(@PathVariable("id") String reportId) {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("id", reportId);
        report.put("status", "PENDING");
        report.put("reason", "inappropriate_behavior");
        report.put("messagesSnapshot", Collections.emptyList());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "report", report
        ));
    }

    @PostMapping("/admin/safety/chat-reports/{id}/action")
    public ResponseEntity<Map<String, Object>> adminActionChatReport(
            @PathVariable("id") String reportId,
            @RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "reportId", reportId,
                "action", body != null ? body.getOrDefault("action", "WARNED") : "WARNED",
                "resolvedAt", new Date().toInstant().toString()
        ));
    }
}
