package com.moneyverse.api.domain.admin.totp;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.BiFunction;

/**
 * Administrator TOTP endpoints (candidate, migration 366). They sit behind AdminApiBoundaryFilter,
 * so every call already carries a verified administrator, and every write a session CSRF proof and
 * a recent password step-up. They are exempt only from the TOTP check itself (AdminTotpScopes).
 */
@RestController
@RequestMapping({"/api/v1/admin/security/totp", "/api/admin/security/totp"})
public class AdminTotpController {
    private final AdminAuthService auth;
    private final AdminTotpService service;

    public AdminTotpController(AdminAuthService auth, AdminTotpService service) {
        this.auth = auth;
        this.service = service;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(HttpServletRequest request) {
        Optional<UUID> actor = auth.resolveVerifiedAdminActor(request);
        if (actor.isEmpty()) return error(401, "login_required");
        return run(() -> service.status(actor.get()), false);
    }

    @PostMapping("/enrolment")
    public ResponseEntity<Map<String, Object>> beginEnrolment(HttpServletRequest request) {
        return withSession(request, (actor, session) -> run(() -> service.beginEnrolment(actor, session), true));
    }

    @PostMapping("/enrolment/confirm")
    public ResponseEntity<Map<String, Object>> confirmEnrolment(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        String code = text(body, "code");
        if (code == null) return error(400, "invalid_request");
        return withSession(request, (actor, session) -> run(() -> service.confirmEnrolment(actor, session, code), false));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        String code = text(body, "code");
        String scope = text(body, "scope");
        if (code == null || scope == null) return error(400, "invalid_request");
        return withSession(request, (actor, session) -> run(() -> service.verify(actor, session, scope, code), false));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> revokeSelf(HttpServletRequest request) {
        return withSession(request, (actor, session) -> run(() -> service.revoke(actor, session, actor), false));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> revokeOther(HttpServletRequest request, @PathVariable String userId) {
        UUID target;
        try {
            target = UUID.fromString(userId);
        } catch (IllegalArgumentException malformed) {
            return error(400, "invalid_request");
        }
        return withSession(request, (actor, session) -> run(() -> service.revoke(actor, session, target), false));
    }

    private ResponseEntity<Map<String, Object>> withSession(HttpServletRequest request,
            BiFunction<UUID, UUID, ResponseEntity<Map<String, Object>>> body) {
        Optional<UUID> actor = auth.resolveVerifiedAdminActor(request);
        if (actor.isEmpty()) return error(401, "login_required");
        Optional<UUID> session = auth.currentSessionId(request, actor.get());
        if (session.isEmpty()) return error(401, "login_required");
        return body.apply(actor.get(), session.get());
    }

    private static ResponseEntity<Map<String, Object>> run(java.util.function.Supplier<Map<String, Object>> call, boolean secretBearing) {
        try {
            var ok = ResponseEntity.ok();
            if (secretBearing) ok = ok.cacheControl(CacheControl.noStore());
            return ok.body(call.get());
        } catch (AdminTotpService.Failure failure) {
            return error(failure.status, failure.code);
        }
    }

    private static String text(Map<String, Object> body, String key) {
        if (body == null) return null;
        Object value = body.get(key);
        return value instanceof String s && !s.isBlank() && s.length() <= 64 ? s : null;
    }

    private static ResponseEntity<Map<String, Object>> error(int status, String code) {
        return ResponseEntity.status(status).cacheControl(CacheControl.noStore()).body(Map.of("ok", false, "code", code));
    }
}
