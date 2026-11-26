package com.moneyverse.api.domain.gameclock.service;

import com.moneyverse.api.domain.gameclock.dto.GameClockDtos.ServerGameClockResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
public class GameClockService {

    private static final Logger log = LoggerFactory.getLogger(GameClockService.class);
    private final JdbcTemplate jdbcTemplate;

    public GameClockService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ServerGameClockResponse current() {
        try {
            String sql = "SELECT clock.policy_version, clock.day_index::text AS day_index, " +
                    "clock.week_index::text AS week_index, clock.day_of_week, " +
                    "clock.real_seconds_per_day, clock.game_days_per_week, " +
                    "clock.day_started_at, clock.day_ends_at, " +
                    "clock.week_started_at, clock.week_ends_at, " +
                    "public.server_game_day_key(clock.day_started_at)::text AS day_key, " +
                    "public.server_game_week_key(clock.day_started_at)::text AS week_key " +
                    "FROM public.server_game_clock() AS clock";

            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                String pv = rs.getString("policy_version");
                long di = Long.parseLong(rs.getString("day_index"));
                long wi = Long.parseLong(rs.getString("week_index"));
                int dow = rs.getInt("day_of_week");
                int rspd = rs.getInt("real_seconds_per_day");
                int gdpw = rs.getInt("game_days_per_week");
                Timestamp dsa = rs.getTimestamp("day_started_at");
                Timestamp dea = rs.getTimestamp("day_ends_at");
                Timestamp wsa = rs.getTimestamp("week_started_at");
                Timestamp wea = rs.getTimestamp("week_ends_at");

                return new ServerGameClockResponse(
                        true,
                        pv,
                        di,
                        wi,
                        dow,
                        rspd,
                        gdpw,
                        dsa != null ? dsa.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC),
                        dea != null ? dea.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC).plusHours(4),
                        wsa != null ? wsa.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC),
                        wea != null ? wea.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC).plusDays(7),
                        rs.getString("day_key"),
                        rs.getString("week_key")
                );
            });
        } catch (Exception ex) {
            // QA 2026-11-26: the fallback answered ok:true with an invented day 42 / week 6,
            // so every page would have shown a calendar the server never kept.
            log.warn("Failed to query server_game_clock: {}", ex.getMessage());
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "GAME_CLOCK_UNAVAILABLE");
        }
    }
}
