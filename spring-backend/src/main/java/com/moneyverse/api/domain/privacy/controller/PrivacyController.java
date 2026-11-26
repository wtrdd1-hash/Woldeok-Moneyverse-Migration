package com.moneyverse.api.domain.privacy.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import org.springframework.jdbc.core.simple.JdbcClient;

@RestController
@RequestMapping(path = {
        "/api/v1/privacy/requests",
        "/api/privacy/requests",
        "/privacy/requests"
})
public class PrivacyController {

    private static final Set<String> TYPES = Set.of("access", "correction", "restriction", "withdrawal", "deletion");
    private final UserAuthService userAuthService;
    private final JdbcClient jdbc;

    public PrivacyController(UserAuthService userAuthService, JdbcClient jdbc) {
        this.userAuthService = userAuthService;
        this.jdbc = jdbc;
    }

    private String getUserIdOrThrow(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return sessionOpt.get().getUserId().toString();
    }

    private HttpHeaders securityHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "private, no-store");
        headers.set("X-Robots-Tag", "noindex");
        return headers;
    }

    /*
     * Audit P0 (2026-11-25): list was always empty and create returned a random id
     * with SUBMITTED without storing anything. Both now use the owner-scoped DB
     * functions; a failure is 503, never an empty list or a fake receipt.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            HttpServletRequest request,
            @RequestParam(name = "type", required = false) String type) {
        String userId = getUserIdOrThrow(request);
        if (type != null && !TYPES.contains(type)) {
            return ResponseEntity.badRequest().headers(securityHeaders()).body(Map.of("code", "PRIVACY_TYPE_INVALID"));
        }
        try {
            List<Map<String, Object>> rows = jdbc.sql("SELECT request_id::text AS request_id, request_type, detail, status, "
                            + "to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') AS created_at "
                            + "FROM public.privacy_list_my_requests(?::uuid, 100) ORDER BY created_at DESC")
                    .param(userId).query().listOfRows();
            List<Map<String, Object>> out = new ArrayList<>();
            for (Map<String, Object> r : rows) {
                if (type != null && !type.equals(r.get("request_type"))) continue;
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("requestId", r.get("request_id"));
                m.put("requestType", r.get("request_type"));
                m.put("detail", r.get("detail"));
                m.put("status", r.get("status"));
                m.put("createdAt", r.get("created_at"));
                out.add(m);
            }
            return ResponseEntity.ok().headers(securityHeaders()).body(Map.of("requests", out));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).headers(securityHeaders()).body(Map.of("code", "PRIVACY_SOURCE_UNAVAILABLE"));
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        String userId = getUserIdOrThrow(request);
        Object rawType = body == null ? null : body.get("requestType");
        Object rawDetail = body == null ? null : body.get("detail");
        Object rawKey = body == null ? null : body.get("idempotencyKey");
        String detail = rawDetail instanceof String d && !d.isBlank() ? d.strip() : null;
        UUID key;
        try { key = rawKey instanceof String k ? UUID.fromString(k) : null; } catch (IllegalArgumentException e) { key = null; }
        if (!(rawType instanceof String type) || !TYPES.contains(type) || key == null
                || (detail != null && detail.codePointCount(0, detail.length()) > 1000)
                || ("correction".equals(type) && detail == null)) {
            return ResponseEntity.badRequest().headers(securityHeaders()).body(Map.of("code", "PRIVACY_REQUEST_INVALID"));
        }
        try {
            Map<String, Object> r = jdbc.sql("SELECT request_id::text AS request_id, request_type, status, "
                            + "to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') AS created_at, replayed "
                            + "FROM public.privacy_create_my_request(?::uuid, ?::text, ?::text, ?::uuid)")
                    .param(userId).param(type).param(detail).param(key).query().listOfRows().stream().findFirst().orElse(null);
            if (r == null || r.get("request_id") == null) throw new IllegalStateException("no receipt");
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("requestId", r.get("request_id"));
            res.put("requestType", r.get("request_type"));
            res.put("status", r.get("status"));
            res.put("createdAt", r.get("created_at"));
            res.put("replayed", r.get("replayed"));
            return ResponseEntity.ok().headers(securityHeaders()).body(res);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).headers(securityHeaders()).body(Map.of("code", "PRIVACY_REQUEST_NOT_RECORDED"));
        }
    }
}
