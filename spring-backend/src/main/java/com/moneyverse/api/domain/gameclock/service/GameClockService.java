package com.moneyverse.api.domain.gameclock.service;

import com.moneyverse.api.domain.gameclock.dto.GameClockDtos.ServerGameClockResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

/**
 * Reads the server game calendar from PostgreSQL (server_game_calendar, migration 353) in one
 * observation. GAMEYEAR.3: no fabricated success. A database failure, a missing row or any NULL
 * field (including a pre-epoch moment, which has no public year) is 503; the previous fallback
 * answered ok:true with dayIndex 42, realSecondsPerDay 14400 and invented boundaries.
 */
@Service
public class GameClockService {

    private static final Logger log = LoggerFactory.getLogger(GameClockService.class);
    static final String SQL = "SELECT policy_version, calendar_version, observed_at, day_index, week_index, day_of_week, "
            + "real_seconds_per_day, game_days_per_week, game_days_per_year, real_seconds_per_game_year, game_year, day_of_year, "
            + "year_started_at, year_ends_at, day_started_at, day_ends_at, week_started_at, week_ends_at, "
            + "day_key::text AS day_key, week_key::text AS week_key FROM public.server_game_calendar()";
    private final JdbcTemplate jdbcTemplate;

    public GameClockService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ServerGameClockResponse current() {
        List<Map<String, Object>> rows;
        try {
            rows = jdbcTemplate.queryForList(SQL);
        } catch (Exception ex) {
            log.warn("Failed to query server_game_calendar: {}", ex.getMessage());
            throw unavailable("GAME_CLOCK_UNAVAILABLE");
        }
        if (rows.size() != 1) throw unavailable("GAME_CLOCK_UNAVAILABLE");
        return fromRow(rows.get(0));
    }

    /** Maps one calendar row; any missing value is unavailable, never defaulted. */
    public static ServerGameClockResponse fromRow(Map<String, Object> r) {
        return new ServerGameClockResponse(
                true,
                text(r, "policy_version"),
                whole(r, "day_index"),
                whole(r, "week_index"),
                (int) whole(r, "day_of_week"),
                (int) whole(r, "real_seconds_per_day"),
                (int) whole(r, "game_days_per_week"),
                time(r, "day_started_at"),
                time(r, "day_ends_at"),
                time(r, "week_started_at"),
                time(r, "week_ends_at"),
                text(r, "day_key"),
                text(r, "week_key"),
                text(r, "calendar_version"),
                whole(r, "game_year"),
                (int) whole(r, "day_of_year"),
                (int) whole(r, "game_days_per_year"),
                whole(r, "real_seconds_per_game_year"),
                time(r, "year_started_at"),
                time(r, "year_ends_at"),
                time(r, "observed_at"));
    }

    private static Object required(Map<String, Object> r, String key) {
        Object v = r.get(key);
        if (v == null) throw unavailable(key.startsWith("game_year") || key.contains("year") ? "GAME_YEAR_UNAVAILABLE" : "GAME_CLOCK_UNAVAILABLE");
        return v;
    }

    private static String text(Map<String, Object> r, String key) {
        return String.valueOf(required(r, key));
    }

    private static long whole(Map<String, Object> r, String key) {
        Object v = required(r, key);
        if (v instanceof Number n) return n.longValue();
        try { return Long.parseLong(v.toString()); } catch (NumberFormatException e) { throw unavailable("GAME_CLOCK_UNAVAILABLE"); }
    }

    private static OffsetDateTime time(Map<String, Object> r, String key) {
        Object v = required(r, key);
        if (v instanceof Timestamp t) return t.toInstant().atOffset(ZoneOffset.UTC);
        if (v instanceof OffsetDateTime o) return o.withOffsetSameInstant(ZoneOffset.UTC);
        throw unavailable("GAME_CLOCK_UNAVAILABLE");
    }

    private static ResponseStatusException unavailable(String code) {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, code);
    }
}
