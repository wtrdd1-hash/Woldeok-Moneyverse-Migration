package com.moneyverse.api.common.time;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * Timestamps the way JavaScript's Date.toISOString() writes them (always milliseconds, UTC 'Z').
 * The frontend validators accept exactly that form; Instant.toString() emits microseconds from
 * PostgreSQL and drops the fraction at whole seconds, so pages treated valid rows as unreadable
 * (/account login methods, 2026-11-25).
 */
public final class JsTime {
    private static final DateTimeFormatter ISO_MS = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);

    private JsTime() {}

    public static String iso(Instant instant) {
        return instant == null ? null : ISO_MS.format(instant);
    }
}
