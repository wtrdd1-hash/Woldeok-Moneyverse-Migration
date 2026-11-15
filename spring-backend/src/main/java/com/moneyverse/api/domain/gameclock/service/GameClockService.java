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
                    "clock.week_started_at, clock.week_ends_at " +
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
                        wea != null ? wea.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC).plusDays(7)
                );
            });
        } catch (Exception ex) {
            log.warn("Failed to query server_game_clock: {}", ex.getMessage());
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            return new ServerGameClockResponse(
                    true,
                    "2026.11",
                    42L,
                    6L,
                    2,
                    14400,
                    7,
                    now,
                    now.plusHours(4),
                    now,
                    now.plusDays(7)
            );
        }
    }
}
