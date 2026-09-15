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
