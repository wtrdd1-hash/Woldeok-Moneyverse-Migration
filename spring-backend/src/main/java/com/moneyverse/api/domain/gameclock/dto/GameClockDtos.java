package com.moneyverse.api.domain.gameclock.dto;

import java.time.OffsetDateTime;

public class GameClockDtos {

    /**
     * The server game calendar (SERVER_GAME_CLOCK_SPEC sections 1-6). The day/week fields and keys
     * are unchanged from v2026.09.15.114; GAMEYEAR.3 adds the year fields after them, so existing
     * readers (web BFF, app, Discord) keep working. Every value comes from one PostgreSQL
     * observation; there is no client-derived or fallback year.
     */
    public record ServerGameClockResponse(
            boolean ok,
            String policyVersion,
            long dayIndex,
            long weekIndex,
            int dayOfWeek,
            int realSecondsPerDay,
            int gameDaysPerWeek,
            OffsetDateTime dayStartedAt,
            OffsetDateTime dayEndsAt,
            OffsetDateTime weekStartedAt,
            OffsetDateTime weekEndsAt,
            /** Synthetic calendar date of this game day / week start (server_game_day_key / _week_key). */
            String dayKey,
            String weekKey,
            /* ---- GAMEYEAR.3 additive fields ---- */
            String calendarVersion,
            long gameYear,
            int dayOfYear,
            int gameDaysPerYear,
            long realSecondsPerGameYear,
            OffsetDateTime yearStartedAt,
            OffsetDateTime yearEndsAt,
            OffsetDateTime observedAt
    ) {}
}
