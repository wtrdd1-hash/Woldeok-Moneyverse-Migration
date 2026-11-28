package com.moneyverse.api.domain.support.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Administrator support console. These routes were never ported from the earlier gateway, so the
 * console page crashed on a 404. Every call goes through the existing role-checked database
 * functions with the verified administrator as actor; writes also pass the boundary filter's CSRF
 * and step-up checks. A failed source answers 503, never an empty list.
 */
@RestController
@RequestMapping({"/api/v1/admin/support", "/api/admin/support"})
public class AdminSupportController {
    private static final Set<String> STATUSES = Set.of("open", "waiting_user", "resolved");

    private final AdminAuthService adminAuthService;
    private final JdbcTemplate jdbc;

    public AdminSupportController(AdminAuthService adminAuthService, JdbcTemplate jdbc) {
        this.adminAuthService = adminAuthService;
        this.jdbc = jdbc;
    }

    private UUID actor(HttpServletRequest request) {
        return adminAuthService.resolveVerifiedAdminActor(request)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "admin_session_required"));
    }

    private static UUID uuid(String raw) {
        try {
            return UUID.fromString(raw);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid identifier");
        }
    }

    private static ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SUPPORT_SOURCE_UNAVAILABLE");
    }

    @GetMapping("/threads")
    public ResponseEntity<Map<String, Object>> threads(HttpServletRequest request,
                                                       @RequestParam(name = "status", required = false) String status) {
        UUID actor = actor(request);
        String filter = status != null && STATUSES.contains(status) ? status : null;
        try {
            List<Map<String, Object>> rows = jdbc.queryForList(
                    "SELECT thread_id::text AS thread_id, user_id::text AS user_id, display_name, subject, status, "
                            + "created_at::text AS created_at, last_message_at::text AS last_message_at "
                            + "FROM public.admin_support_threads(?::uuid, ?, ?::integer)", actor, filter, 200);
            return ResponseEntity.ok(Map.of("threads", rows));
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }

    @GetMapping("/threads/{id}/messages")
    public ResponseEntity<Map<String, Object>> messages(HttpServletRequest request, @PathVariable("id") String id) {
        UUID actor = actor(request);
        UUID thread = uuid(id);
        try {
            List<Map<String, Object>> rows = jdbc.queryForList(
                    "SELECT message_id::text AS message_id, sender_kind, sender_user_id::text AS sender_user_id, body, "
                            + "created_at::text AS created_at FROM public.admin_support_thread_messages(?::uuid, ?::uuid, ?::integer)",
                    actor, thread, 500);
            return ResponseEntity.ok(Map.of("messages", rows));
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }

    @PostMapping("/threads/{id}/messages")
    public ResponseEntity<Map<String, Object>> reply(HttpServletRequest request, @PathVariable("id") String id,
                                                     @RequestBody Map<String, Object> body) {
        UUID actor = actor(request);
        UUID thread = uuid(id);
        String text = body == null ? null : body.get("body") instanceof String s ? s.trim() : null;
        String rawKey = body == null ? null : body.get("idempotencyKey") instanceof String k ? k : null;
        if (text == null || text.isEmpty() || text.length() > 2000 || rawKey == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "body and idempotencyKey are required");
        }
        UUID key = uuid(rawKey);
        try {
            List<Map<String, Object>> receipt = jdbc.queryForList(
                    "SELECT message_id::text AS message_id, sender_kind, body, created_at::text AS created_at "
                            + "FROM public.admin_support_reply(?::uuid, ?::uuid, ?::uuid, ?)", actor, key, thread, text);
            if (receipt.size() != 1) throw unavailable();
            return ResponseEntity.ok(Map.of("message", receipt.get(0)));
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }

    @PutMapping("/threads/{id}/status")
    public ResponseEntity<Map<String, Object>> status(HttpServletRequest request, @PathVariable("id") String id,
                                                      @RequestBody Map<String, Object> body) {
        UUID actor = actor(request);
        UUID thread = uuid(id);
        String status = body == null ? null : body.get("status") instanceof String s ? s : null;
        if (status == null || !STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unknown status");
        }
        try {
            Boolean changed = jdbc.queryForObject(
                    "SELECT public.admin_support_set_status(?::uuid, ?::uuid, ?)", Boolean.class, actor, thread, status);
            if (!Boolean.TRUE.equals(changed)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "thread not found");
            Map<String, Object> out = new LinkedHashMap<>();
            out.put("threadId", thread.toString());
            out.put("status", status);
            return ResponseEntity.ok(out);
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }
}
