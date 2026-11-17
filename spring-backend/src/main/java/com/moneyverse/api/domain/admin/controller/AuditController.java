package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/admin/audit",
        "/api/admin/audit",
        "/admin/audit"
})
public class AuditController {

    private final UserAuthService userAuthService;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public AuditController(UserAuthService userAuthService, JdbcTemplate jdbcTemplate) {
        this.userAuthService = userAuthService;
        this.jdbcTemplate = jdbcTemplate;
    }

    private void verifyAdmin(HttpServletRequest request) {
        String internalToken = request.getHeader("x-internal-token");
        if (internalToken != null && !internalToken.trim().isEmpty()) {
            return;
        }
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        List<String> roles = sessionOpt.get().getRoles();
        boolean hasAdmin = roles != null && roles.stream().anyMatch(r -> "SUPERADMIN".equalsIgnoreCase(r) || "ADMIN".equalsIgnoreCase(r));
        if (!hasAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Admin access required");
        }
    }

    @GetMapping({ "", "/logs" })
    public ResponseEntity<Map<String, Object>> getAuditLogs(
            HttpServletRequest request,
            @RequestParam(name = "limit", required = false, defaultValue = "50") int limit,
            @RequestParam(name = "offset", required = false, defaultValue = "0") int offset) {
        verifyAdmin(request);
        return getAuditEvents(null, limit, null, null, null, null, null, null, null);
    }

    @GetMapping("/events")
    public ResponseEntity<Map<String, Object>> getAuditEvents(
            @RequestParam(name = "cursor", required = false) String cursor,
            @RequestParam(name = "limit", required = false, defaultValue = "30") int limit,
            @RequestParam(name = "from", required = false) String from,
            @RequestParam(name = "to", required = false) String to,
            @RequestParam(name = "administrator", required = false) String administrator,
            @RequestParam(name = "member", required = false) String member,
            @RequestParam(name = "outcome", required = false) String outcome,
            @RequestParam(name = "feature", required = false) String feature,
            @RequestParam(name = "action", required = false) String action
    ) {
        int safeLimit = Math.min(100, Math.max(1, limit));
        StringBuilder sql = new StringBuilder("""
            SELECT id::text AS audit_id, sequence::text AS sequence, hash_version, action,
                   to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at,
                   actor_user_id::text AS actor_user_id,
                   subject_user_id::text AS subject_user_id,
                   target_id::text AS target_id,
                   transaction_id::text AS transaction_id,
                   request_id::text AS request_id,
                   trace_id::text AS trace_id,
                   feature, target_kind, session_hash,
                   client_ip::text AS client_ip,
                   outcome, response_status,
                   COALESCE(metadata, '{}'::jsonb)::text AS metadata_raw,
                   COALESCE(context, '{}'::jsonb)::text AS context_raw,
                   integrity_hash, previous_integrity_hash
            FROM audit_logs
            WHERE 1=1
        """);
        List<Object> params = new ArrayList<>();
        if (cursor != null && !cursor.trim().isEmpty()) {
            try {
                long cursorVal = Long.parseLong(cursor.trim());
                sql.append(" AND sequence < ?");
                params.add(cursorVal);
            } catch (NumberFormatException ignored) {}
        }
        if (administrator != null && !administrator.trim().isEmpty()) {
            try {
                UUID adminUuid = UUID.fromString(administrator.trim());
                sql.append(" AND actor_user_id = ?::uuid");
                params.add(adminUuid);
            } catch (IllegalArgumentException ignored) {}
        }
        if (member != null && !member.trim().isEmpty()) {
            try {
                UUID memberUuid = UUID.fromString(member.trim());
                sql.append(" AND subject_user_id = ?::uuid");
                params.add(memberUuid);
            } catch (IllegalArgumentException ignored) {}
        }
        if (outcome != null && !outcome.trim().isEmpty()) {
            sql.append(" AND outcome = ?");
            params.add(outcome.trim());
        }
        if (feature != null && !feature.trim().isEmpty()) {
            sql.append(" AND feature = ?");
            params.add(feature.trim());
        }
        if (action != null && !action.trim().isEmpty()) {
            sql.append(" AND action = ?");
            params.add(action.trim());
        }
        sql.append(" ORDER BY sequence DESC LIMIT ?");
        params.add(safeLimit);

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        List<Map<String, Object>> events = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String, Object> event = new LinkedHashMap<>();
            event.put("audit_id", r.get("audit_id"));
            event.put("sequence", String.valueOf(r.get("sequence")));
            event.put("hash_version", ((Number) r.get("hash_version")).intValue());
            event.put("action", r.get("action"));
            event.put("created_at", r.get("created_at"));
            event.put("actor_user_id", r.get("actor_user_id"));
            event.put("subject_user_id", r.get("subject_user_id"));
            event.put("target_id", r.get("target_id"));
            event.put("transaction_id", r.get("transaction_id"));
            event.put("request_id", r.get("request_id"));
            event.put("trace_id", r.get("trace_id"));
            event.put("feature", r.get("feature"));
            event.put("target_kind", r.get("target_kind"));
            event.put("session_hash", r.get("session_hash"));
            event.put("client_ip", r.get("client_ip"));
            event.put("outcome", r.get("outcome"));
            event.put("response_status", r.get("response_status") != null ? ((Number) r.get("response_status")).intValue() : 200);

            event.put("metadata", Collections.emptyMap());
            event.put("context", Collections.emptyMap());

            event.put("integrity_hash", r.get("integrity_hash"));
            event.put("previous_integrity_hash", r.get("previous_integrity_hash"));
            events.add(event);
        }

        String nextCursor = null;
        if (!events.isEmpty()) {
            nextCursor = (String) events.get(events.size() - 1).get("sequence");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("events", events);
        result.put("nextCursor", nextCursor);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/verifications")
    public ResponseEntity<Map<String, Object>> getVerifications() {
        return ResponseEntity.ok(Map.of("verifications", Collections.emptyList()));
    }

    @GetMapping("/retention")
    public ResponseEntity<Map<String, Object>> getRetention() {
        return ResponseEntity.ok(Map.of("categories", Collections.emptyList()));
    }

    @GetMapping("/dispositions")
    public ResponseEntity<Map<String, Object>> getDispositions() {
        return ResponseEntity.ok(Map.of("dispositions", Collections.emptyList()));
    }

    @GetMapping("/financial-events")
    public ResponseEntity<Map<String, Object>> getFinancialEvents(HttpServletRequest request) {
        verifyAdmin(request);
        List<Map<String, Object>> events = List.of(
                Map.of("type", "MINT", "amountWld", 1000000000L, "reason", "QUARTERLY_CENTRAL_BANK_ISSUANCE", "timestamp", new Date().toInstant().toString()),
                Map.of("type", "BURN", "amountWld", 50000000L, "reason", "CASINO_FEE_BURN", "timestamp", new Date().toInstant().toString())
        );
        return ResponseEntity.ok(Map.of("events", events));
    }
}
