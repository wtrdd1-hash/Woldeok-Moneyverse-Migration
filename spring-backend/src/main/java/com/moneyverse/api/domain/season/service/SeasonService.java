package com.moneyverse.api.domain.season.service;

import com.moneyverse.api.domain.season.dto.SeasonDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class SeasonService {

    private static final Logger log = LoggerFactory.getLogger(SeasonService.class);
    private final JdbcTemplate jdbcTemplate;

    public SeasonService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public SeasonInfo getCurrentSeason() {
        return new SeasonInfo(
            "99001122-3344-5566-7788-99aabbccdde0",
            "시즌 1: 자본의 태동",
            1,
            "ACTIVE",
            Instant.now().minus(14, ChronoUnit.DAYS),
            Instant.now().plus(16, ChronoUnit.DAYS)
        );
    }

    @Transactional
    /** Active season events from season_active_events; failures surface, never an empty list. */
    public java.util.List<Map<String, Object>> activeEvents() {
        return jdbcTemplate.queryForList("""
            SELECT event_id::text AS event_id, season_id::text AS season_id, season_name, title, description,
                   cost_wld::text AS cost_wld, points_per_entry,
                   to_char(ends_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS ends_at
            FROM public.season_active_events()
            """);
    }
}
