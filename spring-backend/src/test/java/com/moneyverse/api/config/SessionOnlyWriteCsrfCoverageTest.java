package com.moneyverse.api.config;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 2026-11-26 caller verification of the session-only write routes (ratchet baseline): these
 * checked the session but not the CSRF proof. Every caller already sends the proof (profile via
 * lib/mutate, uploads via apiBytes / the chat widgets, burn-draw via its BFF after this change),
 * the dopamine aliases have no caller, and the alias spellings without /api mirror routes the
 * boundary already protects. Their writes now go through the boundary's CSRF check.
 * Deliberate exceptions stay outside: activity telemetry (sendBeacon cannot add headers and
 * records nothing of value) and stubs scheduled for the backend step.
 */
class SessionOnlyWriteCsrfCoverageTest {
    @ParameterizedTest
    @ValueSource(strings = {
            "/api/profile", "/api/v1/profile", "/api/v1/profile/",
            "/api/board/images/uploads", "/api/v1/board/images/uploads",
            "/api/photos/uploads", "/api/v1/photos/uploads",
            "/api/content/chat/upload", "/app-api/v1/content/chat/upload",
            "/api/economy/events/burn-draw/participate", "/api/v1/economy/events/burn-draw/participate",
            "/api/dopamine/claim-streak", "/api/dopamine/streak/claim", "/api/dopamine/bull-bear", "/api/dopamine/dopamine/bull-bear",
            "/profile/image", "/stocks/alerts", "/stocks/alerts/abc", "/board/stock-posts", "/collections/abc"
    })
    void writesRequireTheCsrfProof(String path) {
        assertTrue(SensitiveApiBoundaryFilter.isSessionOnlyWritePath(path), path);
    }

    @Test void deliberateExceptionsAndUnrelatedPathsStayOut() {
        assertFalse(SensitiveApiBoundaryFilter.isSessionOnlyWritePath("/api/activity/events"));
        assertFalse(SensitiveApiBoundaryFilter.isSessionOnlyWritePath("/api/v1/profile/settings/extra/deep"));
        assertFalse(SensitiveApiBoundaryFilter.isSessionOnlyWritePath("/api/v1/stocks"));
    }
}
