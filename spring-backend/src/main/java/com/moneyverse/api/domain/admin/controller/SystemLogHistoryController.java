package com.moneyverse.api.domain.admin.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.moneyverse.api.domain.admin.dto.SystemLogSource;
import com.moneyverse.api.domain.admin.service.SystemLogHistoryService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** Independently authorized history endpoint; no trust in x-internal-token. */
@RestController
@RequestMapping(path = {"/api/v1/admin/logs/system", "/api/admin/logs/system"})
public class SystemLogHistoryController {
    private static final Logger log = LoggerFactory.getLogger(SystemLogHistoryController.class);
    private final UserAuthService auth;
    private final AdminLogConsoleGate consoleGate;
    private final SystemLogHistoryOtpGate otpGate;
    private final SystemLogHistoryService archive;

    public SystemLogHistoryController(UserAuthService auth, AdminLogConsoleGate consoleGate,
                                      SystemLogHistoryOtpGate otpGate, SystemLogHistoryService archive) {
        this.auth = auth;
        this.consoleGate = consoleGate;
        this.otpGate = otpGate;
        this.archive = archive;
    }

    private UserAuthService.SessionInfo verifyAdmin(HttpServletRequest request) {
        UserAuthService.SessionInfo session = auth.resolveSession(request)
                .filter(UserAuthService.SessionInfo::isSignedIn)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required"));
        List<String> roles = session.getRoles();
        if (roles == null || roles.stream().noneMatch(r -> "SUPERADMIN".equalsIgnoreCase(r))
                || !consoleGate.isOpen(session.getSessionId(), session.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Superadmin console required");
        }
        return session;
    }

    private static String auditActor(UserAuthService.SessionInfo session) {
        return Integer.toUnsignedString(session.getUserId().hashCode(), 16);
    }

    private void privateHeaders(HttpServletResponse response) {
        response.setHeader("Cache-Control", "private, no-store");
        response.setHeader("X-Robots-Tag", "noindex, nofollow");
        response.setHeader("Referrer-Policy", "no-referrer");
    }

    @GetMapping("/history")
    public ResponseEntity<JsonNode> history(
            HttpServletRequest request, HttpServletResponse response,
            @RequestParam(name = "source") String source,
            @RequestParam(name = "classification", defaultValue = "routine") String classification,
            @RequestParam(name = "start") String start,
            @RequestParam(name = "end") String end,
            @RequestParam(name = "filter", defaultValue = "") String filter,
            @RequestParam(name = "limit", defaultValue = "100") int limit,
            @RequestParam(name = "cursor", required = false) String cursor) {
        privateHeaders(response);
        var session = verifyAdmin(request);
        final SystemLogSource parsed;
        final Instant from;
        final Instant until;
        try {
            parsed = SystemLogSource.fromString(source);
            from = Instant.parse(start);
            until = Instant.parse(end);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid history source or UTC interval");
        }
        if (List.of("important", "all").contains(classification)
                && !otpGate.allowed(session.getUserId(), session.getSessionId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recent log-view OTP required");
        }
        try {
            JsonNode result = archive.read(parsed, classification, from, until, filter, limit, cursor);
            log.info("admin log history access actorRef={} source={} classification={} status={}",
                    auditActor(session), parsed.name(), classification, result.path("status").asText());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid history request");
        }
    }

    @PostMapping("/history/otp/request")
    public ResponseEntity<Map<String, Object>> requestOtp(
            HttpServletRequest request, HttpServletResponse response) {
        privateHeaders(response);
        var session = verifyAdmin(request);
        try {
            otpGate.request(session.getUserId(), session.getSessionId());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "OTP request rate limited");
        }
        log.info("admin log history OTP requested actorRef={}", auditActor(session));
        return ResponseEntity.ok(Map.of("ok", true, "status", "REQUESTED"));
    }

    public record VerifyOtpRequest(String otpCode) {}

    @PostMapping("/history/otp/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(
            HttpServletRequest request, HttpServletResponse response,
            @RequestBody(required = false) VerifyOtpRequest proof) {
        privateHeaders(response);
        var session = verifyAdmin(request);
        boolean verified = proof != null && otpGate.verify(session.getUserId(),
                session.getSessionId(), proof.otpCode());
        if (!verified) {
            log.warn("admin log history OTP verification failed actorRef={}", auditActor(session));
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid/expired OTP");
        }
        log.info("admin log history OTP verified actorRef={}", auditActor(session));
        return ResponseEntity.ok(Map.of("ok", true, "validSeconds", 300));
    }
}
