package com.moneyverse.api.domain.identity;

import com.moneyverse.api.domain.identity.service.LoginAttemptLimiter;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security review 2026-11-25: neither Spring nor nginx limited login,
 * reauthentication or reset requests. Spring sees every BFF call as 127.0.0.1,
 * so limits are keyed by account, not by IP.
 */
class LoginAttemptLimiterTest {
    @Test void blocksAnAccountAfterTooManyFailuresAndRecoversAfterTheWindow() {
        var limiter = new LoginAttemptLimiter(3, Duration.ofMinutes(15));
        Instant t = Instant.parse("2026-11-25T00:00:00Z");
        for (int i = 0; i < 3; i++) { assertFalse(limiter.blocked("a@b.co", t)); limiter.recordFailure("A@B.co ", t); }
        assertTrue(limiter.blocked("a@b.co", t.plusSeconds(60)));
        assertFalse(limiter.blocked("other@b.co", t), "other accounts are unaffected");
        assertFalse(limiter.blocked("a@b.co", t.plus(Duration.ofMinutes(16))));
    }

    @Test void successClearsTheCounter() {
        var limiter = new LoginAttemptLimiter(2, Duration.ofMinutes(15));
        Instant t = Instant.now();
        limiter.recordFailure("x@y.co", t);
        limiter.recordSuccess("x@y.co");
        limiter.recordFailure("x@y.co", t);
        assertFalse(limiter.blocked("x@y.co", t));
    }

    @Test void memoryStaysBounded() {
        var limiter = new LoginAttemptLimiter(3, Duration.ofMinutes(15));
        Instant t = Instant.now();
        for (int i = 0; i < 60_000; i++) limiter.recordFailure("u" + i + "@x.co", t);
        assertTrue(limiter.trackedKeys() <= 50_000);
    }
}
