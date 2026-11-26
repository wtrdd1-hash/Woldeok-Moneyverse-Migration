package com.moneyverse.api.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;

/**
 * The path the boundary filters must judge: decoded and normalised the way Spring MVC resolves a
 * handler, so the boundary and the handler always agree on which route a request is
 * (review finding 2026-11-26).
 */
final class BoundaryPaths {
    private BoundaryPaths() {}

    /** Decoded, dot-segment-resolved, single-slash path; throws on malformed encoding. */
    static String of(HttpServletRequest request) {
        String raw = request.getRequestURI();
        if (raw == null) return "";
        int semicolon = raw.indexOf(';');
        if (semicolon >= 0) raw = raw.substring(0, semicolon);
        String decoded = UriUtils.decode(raw, StandardCharsets.UTF_8);
        // A '%' left after one decode means a multiply-encoded path. Nothing legitimate routes
        // like that, and judging it would depend on how many times a later layer decodes:
        // treat it as undecodable so each caller applies its fail-closed rule.
        if (decoded.indexOf('%') >= 0) throw new IllegalArgumentException("multiply-encoded path");
        String cleaned = StringUtils.cleanPath(decoded).replaceAll("/{2,}", "/");
        return cleaned.startsWith("/") ? cleaned : "/" + cleaned;
    }
}
