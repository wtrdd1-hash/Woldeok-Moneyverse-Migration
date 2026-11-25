package com.moneyverse.api.domain.identity.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Per-account sliding-window limiter for credential checks (security review 2026-11-25).
 * Keyed by the normalized account key, not the IP: behind the Next BFF every call
 * reaches Spring from 127.0.0.1. Bounded memory; per-process (a single Spring instance).
 */
public class LoginAttemptLimiter {
    private static final int MAX_KEYS = 50_000;
    private final int maxFailures;
    private final Duration window;
    private final Map<String, Deque<Instant>> failures = new ConcurrentHashMap<>();

    public LoginAttemptLimiter(int maxFailures, Duration window) {
        this.maxFailures = maxFailures;
        this.window = window;
    }

    private static String key(String raw) {
        return raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
    }

    public boolean blocked(String account, Instant now) {
        Deque<Instant> q = failures.get(key(account));
        if (q == null) return false;
        synchronized (q) {
            prune(q, now);
            return q.size() >= maxFailures;
        }
    }

    public void recordFailure(String account, Instant now) {
        if (failures.size() >= MAX_KEYS) failures.clear(); // bounded; a flood only resets counters
        Deque<Instant> q = failures.computeIfAbsent(key(account), k -> new ArrayDeque<>());
        synchronized (q) {
            prune(q, now);
            q.addLast(now);
        }
    }

    public void recordSuccess(String account) {
        failures.remove(key(account));
    }

    public int trackedKeys() { return failures.size(); }

    private void prune(Deque<Instant> q, Instant now) {
        Instant cutoff = now.minus(window);
        while (!q.isEmpty() && q.peekFirst().isBefore(cutoff)) q.pollFirst();
    }
}
