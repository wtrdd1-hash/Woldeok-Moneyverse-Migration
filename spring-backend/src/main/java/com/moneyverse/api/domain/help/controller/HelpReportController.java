package com.moneyverse.api.domain.help.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/help",
        "/api/help",
        "/help"
})
public class HelpReportController {

    private final UserAuthService userAuthService;

    @Autowired
    public HelpReportController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
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

    @PostMapping("/articles/{locale}/{slug}/report")
    public ResponseEntity<Map<String, Object>> report(
            HttpServletRequest request,
            @PathVariable("locale") String locale,
            @PathVariable("slug") String slug,
            @RequestBody(required = false) Map<String, Object> body) {
        getUserIdOrThrow(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "HELP_REPORT_SOURCE_UNAVAILABLE");
    }
}
