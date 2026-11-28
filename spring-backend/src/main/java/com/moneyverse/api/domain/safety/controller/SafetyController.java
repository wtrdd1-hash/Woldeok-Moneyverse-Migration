package com.moneyverse.api.domain.safety.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.regex.Pattern;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.jdbc.core.simple.JdbcClient;

@RestController
@RequestMapping(path = {
        "/api/v1",
        "/api",
        ""
})
public class SafetyController {
    private static final Set<String> REQUESTER = Set.of("victim_self", "legal_guardian", "authorized_rep", "third_party");
    private static final Set<String> REASON = Set.of("non_consensual_private_image", "underage_harmful_content", "doxxing_credible_threat",
            "impersonation_account_takeover", "harassment_stalking", "illegal_content");
    private static final Set<String> CONTENT = Set.of("board_post", "board_comment", "gallery_photo", "chat_message", "profile_bio", "other");
    private static final Set<String> ADMIN_STATUS = Set.of("TRIAGED", "ACTIONED_REMOVED", "ACTIONED_RESTRICTED", "REJECTED", "APPEALED");
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]{1,64}@[^\\s@]{1,255}\\.[^\\s@]{2,}$");
    private static final String ISO = "'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"'";

    private final JdbcClient jdbc;
    private final AdminAuthService admin;

    public SafetyController(JdbcClient jdbc, AdminAuthService admin) {
        this.jdbc = jdbc;
        this.admin = admin;
    }

    private static String str(Map<String, Object> b, String k) {
        return b != null && b.get(k) instanceof String v ? v.strip() : null;
    }

    private static ResponseEntity<Map<String, Object>> code(HttpStatus s, String c) {
        return ResponseEntity.status(s).body(Map.of("success", false, "code", c));
    }


    /*
     * Audit P0 (2026-11-25): submit returned a random case id without storing anything,
     * status always said IN_REVIEW and the admin queue was always empty. All four now use
     * the safety_* DB functions; the passcode is stored only as SHA-256 (NestJS contract).
     */
    @PostMapping("/safety/takedown")
    public ResponseEntity<Map<String, Object>> submitEmergencyTakedown(@RequestBody(required = false) Map<String, Object> body) {
        String email = str(body, "requesterEmail"), requester = str(body, "requesterType"), reason = str(body, "reasonCategory");
        String url = str(body, "targetContentUrl"), content = str(body, "targetContentType"), description = str(body, "description");
        String passcode = str(body, "passcode");
        boolean urlOk = url != null && url.length() <= 1024 && url.matches("^https?://\\S+$");
        if (email == null || !EMAIL.matcher(email).matches() || !REQUESTER.contains(requester) || !REASON.contains(reason)
                || !urlOk || !CONTENT.contains(content) || description == null || description.length() < 10 || description.length() > 4000
                || passcode == null || passcode.length() < 6 || passcode.length() > 64) {
            return code(HttpStatus.BAD_REQUEST, "TAKEDOWN_INPUT_INVALID");
        }
        try {
            String caseId = jdbc.sql("SELECT public.safety_submit_emergency_takedown(?::varchar, ?::varchar, ?::varchar, ?::varchar, ?::varchar, ?::text, ?::varchar)")
                    .param(email).param(requester).param(reason).param(url).param(content).param(description)
                    .param(UserAuthService.sha256(passcode)).query(String.class).single();
            if (caseId == null || caseId.isBlank()) throw new IllegalStateException("no case id");
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("caseId", caseId);
            res.put("status", "SUBMITTED");
            res.put("message", "긴급 콘텐츠 삭제 요청이 정상 접수되었습니다. 접수 번호와 비밀번호로 처리 상태를 확인하실 수 있습니다.");
            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (RuntimeException e) {
            return code(HttpStatus.SERVICE_UNAVAILABLE, "TAKEDOWN_NOT_RECORDED");
        }
    }

    @PostMapping("/safety/takedown/status")
    public ResponseEntity<Map<String, Object>> getTakedownStatus(@RequestBody(required = false) Map<String, Object> body) {
        String caseId = str(body, "caseId"), passcode = str(body, "passcode");
        if (caseId == null || caseId.length() < 5 || caseId.length() > 32 || passcode == null || passcode.length() < 6 || passcode.length() > 64) {
            return code(HttpStatus.BAD_REQUEST, "TAKEDOWN_QUERY_INVALID");
        }
        try {
            var row = jdbc.sql("SELECT case_id, status, reason_category, target_content_type, "
                            + "CASE WHEN actioned_at IS NULL THEN NULL ELSE to_char(actioned_at AT TIME ZONE 'UTC', " + ISO + ") END AS actioned_at, "
                            + "to_char(created_at AT TIME ZONE 'UTC', " + ISO + ") AS created_at FROM public.safety_get_takedown_status(?::text, ?::text)")
                    .param(caseId).param(UserAuthService.sha256(passcode)).query().listOfRows().stream().findFirst();
            if (row.isEmpty()) return code(HttpStatus.NOT_FOUND, "TAKEDOWN_NOT_FOUND");
            var r = row.get();
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("caseId", r.get("case_id"));
            res.put("status", r.get("status"));
            res.put("reasonCategory", r.get("reason_category"));
            res.put("targetContentType", r.get("target_content_type"));
            res.put("actionedAt", r.get("actioned_at"));
            res.put("createdAt", r.get("created_at"));
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            return code(HttpStatus.SERVICE_UNAVAILABLE, "TAKEDOWN_SOURCE_UNAVAILABLE");
        }
    }

    @GetMapping("/admin/safety/takedowns")
    public ResponseEntity<Map<String, Object>> adminListTakedowns(
            HttpServletRequest request,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "limit", required = false, defaultValue = "50") int limit,
            @RequestParam(name = "offset", required = false, defaultValue = "0") int offset) {
        // Checked here as well: the bare /admin/** GET alias is outside AdminApiBoundaryFilter.
        var actor = admin.resolveVerifiedAdminActor(request);
        if (actor.isEmpty()) return code(HttpStatus.UNAUTHORIZED, "admin_session_required");
        if (limit < 1 || limit > 100 || offset < 0 || offset > 10000) return code(HttpStatus.BAD_REQUEST, "PAGING_INVALID");
        try {
            List<Map<String, Object>> items = jdbc.sql("SELECT id::text AS id, case_id, requester_email, requester_type, reason_category, target_content_url, "
                            + "target_content_type, description, status, admin_notes, actioned_at::text AS actioned_at, created_at::text AS created_at, updated_at::text AS updated_at "
                            + "FROM public.safety_admin_list_takedowns(?::uuid, ?::text, ?, ?)")
                    .param(actor.get()).param(status).param(limit).param(offset).query().listOfRows();
            return ResponseEntity.ok(Map.of("items", items, "count", items.size()));
        } catch (RuntimeException e) {
            return code(HttpStatus.SERVICE_UNAVAILABLE, "TAKEDOWN_SOURCE_UNAVAILABLE");
        }
    }

    @PostMapping("/admin/safety/takedowns/{caseId}/action")
    public ResponseEntity<Map<String, Object>> adminActionTakedown(
            HttpServletRequest request,
            @PathVariable("caseId") String caseId,
            @RequestBody(required = false) Map<String, Object> body) {
        var actor = admin.resolveVerifiedAdminActor(request);
        if (actor.isEmpty()) return code(HttpStatus.UNAUTHORIZED, "admin_session_required");
        if (!admin.hasVerifiedSessionCsrf(request)) return code(HttpStatus.FORBIDDEN, "csrf_required");
        String newStatus = str(body, "newStatus"), notes = str(body, "adminNotes");
        if (!ADMIN_STATUS.contains(newStatus) || (notes != null && notes.length() > 2000)) return code(HttpStatus.BAD_REQUEST, "TAKEDOWN_ACTION_INVALID");
        try {
            Boolean ok = jdbc.sql("SELECT public.safety_admin_action_takedown(?::uuid, ?::text, ?::text, ?::text)")
                    .param(actor.get()).param(caseId).param(newStatus).param(notes).query(Boolean.class).single();
            if (!Boolean.TRUE.equals(ok)) return code(HttpStatus.NOT_FOUND, "TAKEDOWN_NOT_FOUND");
            return ResponseEntity.ok(Map.of("success", true, "caseId", caseId, "newStatus", newStatus));
        } catch (RuntimeException e) {
            return code(HttpStatus.SERVICE_UNAVAILABLE, "TAKEDOWN_SOURCE_UNAVAILABLE");
        }
    }

    @GetMapping("/admin/safety/chat-reports")
    public ResponseEntity<Map<String, Object>> adminListChatReports(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "limit", required = false, defaultValue = "50") int limit,
            @RequestParam(name = "offset", required = false, defaultValue = "0") int offset) {
        // Security review 2026-11-28: this answered with constants an operator would act on.
        // Unavailable until read from its canonical source; never invented evidence.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "CHAT_REPORT_SOURCE_UNAVAILABLE");
    }

    @GetMapping("/admin/safety/chat-reports/{id}")
    public ResponseEntity<Map<String, Object>> adminGetChatReport(@PathVariable("id") String reportId) {
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "CHAT_REPORT_SOURCE_UNAVAILABLE");
    }

    @PostMapping("/admin/safety/chat-reports/{id}/action")
    public ResponseEntity<Map<String, Object>> adminActionChatReport(
            @PathVariable("id") String reportId,
            @RequestBody(required = false) Map<String, Object> body) {
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "CHAT_REPORT_SOURCE_UNAVAILABLE");
    }
}
