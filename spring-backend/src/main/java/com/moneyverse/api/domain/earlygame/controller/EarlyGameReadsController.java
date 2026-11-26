package com.moneyverse.api.domain.earlygame.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Member reads for growth, the early game and engagement, ported from the NestJS
 * EarlyGame/Progression/Engagement controllers (signed-in sweep 2026-11-25: they were 503
 * placeholders or 404 while the DB functions exist with EXECUTE for the app role).
 * Every figure comes from the SECURITY DEFINER function; rows keep the node-pg shapes the
 * pages were written against. Nothing here writes or grants.
 */
@Tag(name = "Early game reads", description = "Growth stage, early-game ladder, weekly goals, collections, engagement board")
@RestController
public class EarlyGameReadsController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(EarlyGameReadsController.class);
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final DateTimeFormatter ISO_MS = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);
    private final JdbcClient jdbc;
    private final MemberApiGuard guard;

    public EarlyGameReadsController(JdbcClient jdbc, MemberApiGuard guard) {
        this.jdbc = jdbc;
        this.guard = guard;
    }

    @GetMapping({"/api/v1/early-game/today", "/api/early-game/today", "/early-game/today"})
    @Operation(summary = "The event this member is dealt today (null when the catalogue is off)")
    public ResponseEntity<?> today(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        List<Map<String, Object>> rows = rows("""
                SELECT event.event_date::text AS event_date, event.event_code, event.event_label, event.event_detail,
                       event.claim_label, event.reward_amount::text AS reward_amount, event.reward_experience::text AS reward_experience,
                       event.experience_blocked, event.reward_item_name, event.reward_item_quantity,
                       event.pending_effect, event.claimed, event.claimed_at,
                       event.claim_transaction_id::text AS claim_transaction_id, event.claim_block
                FROM public.early_event_today(?::uuid) AS event""", actor);
        return ok(Collections.singletonMap("event", rows.isEmpty() ? null : rows.get(0)));
    }

    @GetMapping({"/api/v1/early-game/first-day", "/api/early-game/first-day", "/early-game/first-day"})
    @Operation(summary = "The seven first-day steps, counted from what happened")
    public ResponseEntity<?> firstDay(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        return ok(Map.of("steps", rows("""
                SELECT step.step_code, step.step_label, step.step_detail, step.step_href,
                       step.step_metric, step.step_verified, step.step_target::text AS step_target,
                       step.step_progress::text AS step_progress, step.step_unit, step.step_done
                FROM public.early_first_day_flow(?::uuid) AS step""", actor)));
    }

    @GetMapping({"/api/v1/progression", "/api/progression"})
    @Operation(summary = "The caller's growth stage and what unlocks the next one")
    public ResponseEntity<?> progression(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        List<Map<String, Object>> rows = rows("""
                SELECT progression.stage_code, progression.reached_at,
                       progression.next_stage_code, progression.next_requirements
                FROM public.progression_my_status(?::uuid) AS progression""", actor);
        return ok(Collections.singletonMap("progression", rows.isEmpty() ? null : rows.get(0)));
    }

    @GetMapping({"/api/v1/progression/credit", "/api/progression/credit"})
    @Operation(summary = "The caller's credit grade, what each grade buys, and their loans")
    public ResponseEntity<?> credit(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        List<Map<String, Object>> grade = rows("SELECT public.bank_credit_grade(?::uuid) AS grade", actor);
        if (grade.isEmpty()) throw unavailable(null);
        List<Map<String, Object>> loans = rows("""
                SELECT loan.loan_id::text AS loan_id, loan.principal_amount::text AS principal_amount,
                       loan.interest_amount::text AS interest_amount, loan.outstanding_amount::text AS outstanding_amount,
                       loan.status, loan.issued_at, loan.repaid_at
                FROM public.bank_my_loans(?::uuid) AS loan""", actor);
        List<Map<String, Object>> ladder = rows("""
                SELECT rung.grade, rung.minimum_account_days, rung.minimum_work_completions,
                       rung.credit_limit::text AS credit_limit, rung.interest_bps, rung.term_days,
                       rung.minimum_repayment::text AS minimum_repayment, rung.held
                FROM public.bank_credit_ladder(?::uuid) AS rung""", actor);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("grade", grade.get(0).get("grade"));
        out.put("loans", loans);
        out.put("ladder", ladder);
        return ok(out);
    }

    @GetMapping({"/api/v1/progression/early-game", "/api/progression/early-game"})
    @Operation(summary = "The early-game unlock ladder and what the caller has reached")
    public ResponseEntity<?> unlocks(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        return ok(Map.of("unlocks", rows("""
                SELECT rung.unlock_code, rung.unlock_label, rung.unlock_detail, rung.unlock_business_symbol,
                       rung.needs_job_level, rung.needs_account_days, rung.needs_work_completions,
                       rung.is_enforced, rung.unlocked, rung.next_up,
                       rung.member_job_level, rung.member_account_days, rung.member_work_completions
                FROM public.early_game_unlocks(?::uuid) AS rung""", actor)));
    }

    @GetMapping({"/api/v1/engagement", "/api/engagement"})
    @Operation(summary = "Today's goals, this week's goals, the next unlock and the preference")
    public ResponseEntity<?> engagement(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        List<Map<String, Object>> rows = rows("""
                SELECT board.today_tasks, board.weekly_goals, board.next_unlock, board.notifications_enabled
                FROM public.member_engagement_dashboard(?::uuid) AS board""", actor);
        if (rows.isEmpty()) throw unavailable(null);
        return ok(rows.get(0));
    }

    @GetMapping({"/api/v1/engagement/early-game", "/api/engagement/early-game"})
    @Operation(summary = "The early-game weekly goals and collection books")
    public ResponseEntity<?> weeklyAndCollections(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        List<Map<String, Object>> goals = rows("""
                SELECT goal.goal_code, goal.goal_label, goal.goal_detail, goal.goal_metric,
                       goal.goal_window, goal.goal_target::text AS goal_target, goal.goal_progress::text AS goal_progress,
                       goal.goal_unit, goal.goal_self_reported, goal.goal_completed, goal.week_start::text AS week_start
                FROM public.early_game_weekly_goals(?::uuid) AS goal""", actor);
        List<Map<String, Object>> collections = rows("""
                SELECT book.book_code, book.book_label, book.book_detail, book.reward_title,
                       book.reward_note, book.reward_held, book.entry_total, book.entry_unlocked, book.entries
                FROM public.early_game_collections(?::uuid) AS book""", actor);
        return ok(Map.of("goals", goals, "collections", collections));
    }

    @GetMapping({"/api/v1/engagement/dopamine/vip-chest/status", "/api/engagement/dopamine/vip-chest/status"})
    @Operation(summary = "VIP chest availability: not available (no verified entitlement or ledger receipt)")
    public ResponseEntity<?> vipChestStatus(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("userId", actor.toString());
        out.put("available", false);
        out.put("isPlusUser", null);
        out.put("claimedToday", null);
        out.put("rewardAmount", "0");
        out.put("diceAwarded", 0);
        out.put("nextAvailableAt", null);
        out.put("reason", "unverified_entitlement_and_ledger_receipt");
        return ok(out);
    }

    /** node-pg shapes: int8/numeric as text, json/jsonb parsed, timestamps as ISO with milliseconds. */
    public static Map<String, Object> nodeShape(Map<String, Object> row) {
        Map<String, Object> out = new LinkedHashMap<>();
        row.forEach((k, v) -> out.put(k, value(v)));
        return out;
    }

    private static Object value(Object v) {
        if (v == null) return null;
        if (v instanceof Long || v instanceof BigDecimal || v instanceof java.math.BigInteger) return v.toString();
        if (v instanceof java.sql.Timestamp t) return ISO_MS.format(t.toInstant());
        if (v instanceof java.time.OffsetDateTime o) return ISO_MS.format(o.toInstant());
        if (v instanceof java.sql.Array a) {
            try {
                Object[] items = (Object[]) a.getArray();
                List<Object> list = new ArrayList<>();
                for (Object i : items) list.add(value(i));
                return list;
            } catch (SQLException e) { throw unavailable(e); }
        }
        if ("org.postgresql.util.PGobject".equals(v.getClass().getName())) {
            String raw = v.toString();
            try { return raw == null ? null : JSON.readValue(raw, Object.class); }
            catch (Exception e) { return raw; }
        }
        return v;
    }

    private List<Map<String, Object>> rows(String sql, UUID actor) {
        try {
            List<Map<String, Object>> out = new ArrayList<>();
            for (Map<String, Object> r : jdbc.sql(sql).param(actor).query().listOfRows()) out.add(nodeShape(r));
            return out;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (RuntimeException e) {
            throw unavailable(e);
        }
    }

    private static ResponseStatusException unavailable(Exception e) {
        if (e != null) {
            Throwable c = NestedExceptionUtils.getMostSpecificCause(e);
            String state = c instanceof SQLException sql ? sql.getSQLState() : "-";
            log.warn("[early-game-reads] db call failed: {} sqlstate={} {}", c.getClass().getSimpleName(), state, String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
        }
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "EARLY_GAME_SOURCE_UNAVAILABLE");
    }

    private static ResponseEntity<?> ok(Object body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(body);
    }
}
