package com.moneyverse.api.domain.gameclock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.moneyverse.api.domain.gameclock.service.GameClockService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/** GAMEYEAR.3: one DB observation, additive contract, honest failure (no ok:true fallback). */
class GameYearContractTest {
    static Map<String, Object> row() {
        Map<String, Object> r = new HashMap<>();
        r.put("policy_version", "v2026.09.15.114");
        r.put("calendar_version", "v2026.11.26.GAMEYEAR.2");
        r.put("observed_at", Timestamp.from(Instant.parse("2026-11-26T00:03:25.488Z")));
        r.put("day_index", 10422L);
        r.put("week_index", 1488L);
        r.put("day_of_week", (short) 7);
        r.put("real_seconds_per_day", 600);
        r.put("game_days_per_week", (short) 7);
        r.put("game_days_per_year", 365);
        r.put("real_seconds_per_game_year", 219000L);
        r.put("game_year", 29L);
        r.put("day_of_year", 203);
        r.put("year_started_at", Timestamp.from(Instant.parse("2026-11-24T14:20:00Z")));
        r.put("year_ends_at", Timestamp.from(Instant.parse("2026-11-27T03:10:00Z")));
        r.put("day_started_at", Timestamp.from(Instant.parse("2026-11-26T00:00:00Z")));
        r.put("day_ends_at", Timestamp.from(Instant.parse("2026-11-26T00:10:00Z")));
        r.put("week_started_at", Timestamp.from(Instant.parse("2026-11-25T23:00:00Z")));
        r.put("week_ends_at", Timestamp.from(Instant.parse("2026-11-26T00:10:00Z")));
        r.put("day_key", "2028-07-14");
        r.put("week_key", "2028-07-08");
        return r;
    }

    @Test void mapsTheYearAndKeepsEveryExistingField() throws Exception {
        var res = GameClockService.fromRow(row());
        assertEquals(29, res.gameYear());
        assertEquals(203, res.dayOfYear());
        assertEquals(219000, res.realSecondsPerGameYear());
        ObjectMapper om = new ObjectMapper().registerModule(new JavaTimeModule()).disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        Map<?, ?> json = om.readValue(om.writeValueAsString(res), Map.class);
        for (String old : List.of("ok", "policyVersion", "dayIndex", "weekIndex", "dayOfWeek", "realSecondsPerDay", "gameDaysPerWeek",
                "dayStartedAt", "dayEndsAt", "weekStartedAt", "weekEndsAt", "dayKey", "weekKey")) {
            assertTrue(json.containsKey(old), "existing field kept: " + old);
        }
        for (String added : List.of("calendarVersion", "gameYear", "dayOfYear", "gameDaysPerYear", "realSecondsPerGameYear", "yearStartedAt", "yearEndsAt", "observedAt")) {
            assertTrue(json.containsKey(added), "year field added: " + added);
        }
        assertEquals(10422, ((Number) json.get("dayIndex")).longValue());
    }

    @Test void aNullYearIsUnavailableNeverDefaulted() {
        var r = row();
        r.put("game_year", null);
        var e = assertThrows(ResponseStatusException.class, () -> GameClockService.fromRow(r));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, e.getStatusCode());
        assertEquals("GAME_YEAR_UNAVAILABLE", e.getReason());
        var r2 = row();
        r2.put("day_ends_at", null);
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, assertThrows(ResponseStatusException.class, () -> GameClockService.fromRow(r2)).getStatusCode());
    }

    @Test void aDatabaseFailureIsUnavailableNotFabricated() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(anyString())).thenThrow(new org.springframework.dao.DataAccessResourceFailureException("db down"));
        var e = assertThrows(ResponseStatusException.class, () -> new GameClockService(jdbc).current());
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, e.getStatusCode());
        doReturn(List.of()).when(jdbc).queryForList(anyString());
        assertThrows(ResponseStatusException.class, () -> new GameClockService(jdbc).current());
    }
}
