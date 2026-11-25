# Woldeok Moneyverse — Server Game Clock Specification

> Version: v2026.09.15.114
> Status: implementation-oriented runtime contract
> Date: 2026-09-15
> Korean counterpart: [SERVER_GAME_CLOCK_SPEC.ko.md](SERVER_GAME_CLOCK_SPEC.ko.md)

## 1. Purpose

Moneyverse uses an accelerated in-world calendar for repeatable gameplay limits and rotations. The game clock is server-authoritative and independent from the real-world civil calendar.

Baseline:
- 10 real minutes = 1 server day;
- 7 server days = 1 server week;
- therefore 70 real minutes = 1 server week;
- epoch: 2026-09-15 00:00:00 KST;
- policy version: `v2026.09.15.114`.

The clock exists to let players re-enter daily/weekly loops without waiting a real day while preserving one shared server definition of "today" and "this week".

## 2. Authoritative data model

`server_game_clock_policy` owns the epoch, real seconds per server day, server days per week and policy version. Application roles may read the clock through SECURITY DEFINER functions but cannot update the policy table directly.

Authoritative functions:
- `server_game_clock(at)` — resolved day/week indexes and boundaries;
- `server_game_day_key(at)` — synthetic stable date key for day-scoped records;
- `server_game_week_key(at)` — synthetic stable date key for week-scoped records;
- `server_game_day_start(at)` — real timestamp at the current server-day boundary;
- `server_game_week_start(at)` — real timestamp at the current server-week boundary.

## 3. Scope in v2026.09.15.114

The accelerated clock is applied to:
- work-task per-day completion quota and work reward day/week windows;
- shop catalogue `daily_N` and `weekly_N` purchase limits;
- UI world-time context exposed through the authenticated casino clock read.

The accelerated clock is **not** applied to:
- casino protective stake/loss limits;
- casino self-exclusion or cooling-off locks;
- authentication/session expiry, password/email verification, security cooldowns;
- audit retention, backup schedules, legal/compliance retention;
- any real-world age, jurisdiction or distribution requirement.

Casino protective limits remain civil-day safety controls. Compressing them to ten minutes would multiply allowed real-world exposure and violate the casino safety specification.

## 4. UX contract

Surfaces using the accelerated clock must say `server day` / `server week` when confusion with real time is possible. A server-time status may show the next boundary timestamp, but casino surfaces must not use a ticking countdown that creates wagering pressure.

The casino visual refresh may increase clarity, game identity and result legibility, but must not use loss-chasing copy, near-miss manipulation, streak pressure, urgency prompts or a CTA that implies better odds.

## 5. Migration and rollback

Migration `190-server-game-clock.sql` is forward-only. The policy table is versioned and the clock epoch is deterministic across Test and Production. Rollback of the application must not rewrite already-applied migration history; an emergency follow-up migration may change the policy interval or restore a prior policy version.

Before Production promotion, Test must prove:
1. 00:10 after epoch resolves to server day index 1;
2. 01:10 after epoch resolves to week index 1/day 1;
3. work board and work completion use the same server-day boundary;
4. shop daily/weekly limits use the same day/week starts;
5. casino protective limits continue using real civil-day usage;
6. no real-time security or self-exclusion control uses the accelerated clock.

## 6. Moneyverse year extension — v2026.11.26.GAMEYEAR.1 (planning candidate)

Owner request: add a server-specific year. Proposed fixed 365-day calendar, subject to review before implementation; keep the existing epoch (2026-09-15 00:00 KST), 600 real seconds/day, seven-day continuous weeks and all existing day/week keys. This is a logical calendar, not Gregorian time; no leap days, no year zero, no month definition in this increment. Year 1 starts at epoch; existing worlds derive their year from the original epoch, never reset on rollout, restart or season change.

- For authoritative zero-based day index d >= 0: yearIndex = floor(d / 365), gameYear = yearIndex + 1, dayOfYear = (d mod 365) + 1. Pre-epoch values have no public year. A year is 219000 real seconds (60h50m); start = epoch + yearIndex * 219000 seconds; end = start + 219000 seconds. Half-open intervals [start, end). Weeks may span years; never reset global weekIndex or dayIndex. Synthetic SQL day keys are not display years.
- Proposed additive API fields on existing game-clock contract: calendarVersion, gameYear, dayOfYear, gameDaysPerYear, realSecondsPerGameYear, yearStartedAt, yearEndsAt, observedAt (real ISO-8601 timestamps for boundaries and observation). Keep old day/week fields; web BFF, app and Discord consume the same Spring/DB authority. No client date-derived authoritative year, fake fallback or stale success; show unavailable or explicitly stale last verified value, re-fetch at boundary/reconnect/focus. EN default ("Moneyverse Year 28 · Day 1"), KO second ("머니버스 28년 · 1일차"), preserve supported locales and distinguish real timestamps. Display compact year/day and existing week in shared header, responsive mobile navigation, dashboard and relevant game reports; do not add wagering urgency.
- At epoch + 218999s: year 1 day 365; +219000s: year 2 day 1; +219001s: year 2 day 1. At day index 365*27: year 28 day 1. Use single DB observation and versioned, immutable historical mappings. Policy changes require explicit effective boundary, continuity and migration approval; never reinterpret old receipts.
- Calendar is display/read-only initially; year-based reports can group existing events by verified game-year boundaries. No automatic annual payout, tax, dividends, bond accrual, account/season reset, maturity or interest change. E542-04 remains BLOCKED until product-specific rate basis, compounding, rounding, funding and separate approval. Real authentication, security, casino safety, legal/consent, backups and audit timestamps remain real-world time.
- Source finding: Spring GameClockService.current() currently catches DB errors and returns ok=true with fabricated dayIndex=42 and realSecondsPerDay=14400, and substitutes null boundaries. This contradicts authoritative time; remove these paths and prove honest non-success before year release. Source observation, not a live outage claim.
- Implementation order: GAMEYEAR.2 forward-only DB calendar/read function and boundary regression (do not alter migration 190); GAMEYEAR.3 Spring DTO/service/controller and failure/compatibility tests; GAMEYEAR.4 web/app/Discord contract and localized header, responsive and reconnect QA; GAMEYEAR.5 isolated exact-artifact Test with real DB, restart, clock skew, duplicate boundary, day/week, finance and safety regressions; separate owner-approved zero-downtime Production promotion with rollback evidence. Test before Production; no data conversion without separate approval. This planning entry alone authorizes no runtime or financial changes.
