package com.moneyverse.api.common;

import com.moneyverse.api.common.time.JsTime;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class JsTimeTest {
    @Test void matchesDateToIsoString() {
        assertEquals("2026-11-25T06:58:03.923Z", JsTime.iso(Instant.parse("2026-11-25T06:58:03.923583Z")));
        assertEquals("2026-11-25T06:58:03.000Z", JsTime.iso(Instant.parse("2026-11-25T06:58:03Z")));
        assertNull(JsTime.iso(null));
    }
}
