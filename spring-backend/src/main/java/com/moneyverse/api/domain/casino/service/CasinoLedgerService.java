package com.moneyverse.api.domain.casino.service;

import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Casino plays, history, self-limits and the server clock through the
 * casino_play_* / member_casino_* / server_game_clock DB functions (port of the
 * NestJS CasinoRepository). Outcome, odds and ledger settlement belong to the
 * database; nothing here decides or fabricates a result.
 */
@Service
public class CasinoLedgerService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CasinoLedgerService.class);
    private static final String ISO = "'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"'";
    private static final String PLAY_TAIL = "play.net_amount::text AS net_amount, play.transaction_id::text AS transaction_id, play.replayed, "
            + "play.win_probability_ppm, play.payout_multiplier_ppm, play.worst_case_loss::text AS worst_case_loss";
    /** Requests the rules refuse (limits, self-exclusion, replay mismatch). */
    private static final Set<String> RULE_REFUSALS = Set.of("22023", "23505", "55000", "P0001");

    private final JdbcClient jdbc;

    public CasinoLedgerService(JdbcClient jdbc) { this.jdbc = jdbc; }

    public Map<String, Object> playCoin(UUID key, UUID actor, String choice, long stake) {
        return play("SELECT play.play_id::text AS play_id, play.outcome, " + PLAY_TAIL
                + " FROM public.casino_play_coin(?::uuid, ?::uuid, ?::text, ?::bigint) AS play", key, actor, choice, stake);
    }

    public Map<String, Object> playDice(UUID key, UUID actor, String game, String choice, long stake) {
        return play("SELECT play.play_id::text AS play_id, play.outcome_face, " + PLAY_TAIL
                + " FROM public.casino_play_dice(?::uuid, ?::uuid, ?::text, ?::text, ?::bigint) AS play", key, actor, game, choice, stake);
    }

    public Map<String, Object> playTheme(UUID key, UUID actor, String game, String choice, long stake) {
        return play("SELECT play.play_id::text AS play_id, play.outcome, " + PLAY_TAIL
                + " FROM public.casino_play_theme(?::uuid, ?::uuid, ?::text, ?::text, ?::bigint) AS play", key, actor, game, choice, stake);
    }

    public List<Map<String, Object>> history(UUID actor) {
        return read(() -> jdbc.sql("SELECT h.play_id::text AS play_id, h.game, h.choice, h.outcome, h.stake_amount::text AS stake_amount, "
                        + "h.net_amount::text AS net_amount, h.transaction_id::text AS transaction_id, "
                        + "to_char(h.played_at AT TIME ZONE 'UTC', " + ISO + ") AS played_at "
                        + "FROM public.member_casino_history(?::uuid, 20) AS h")
                .param(actor).query().listOfRows());
    }

    public Map<String, Object> selfLimit(UUID actor) {
        return read(() -> jdbc.sql("SELECT l.daily_bet_limit::text AS daily_bet_limit, l.daily_loss_limit::text AS daily_loss_limit, "
                        + "CASE WHEN l.locked_until IS NULL THEN NULL ELSE to_char(l.locked_until AT TIME ZONE 'UTC', " + ISO + ") END AS locked_until "
                        + "FROM public.member_casino_self_limit(?::uuid) AS l")
                .param(actor).query().listOfRows().stream().findFirst().orElseThrow(() -> unavailable("CASINO_SELF_LIMIT_MISSING")));
    }

    public void setSelfLimit(UUID actor, long dailyBet, long dailyLoss, String lockedUntil) {
        write(() -> jdbc.sql("SELECT public.member_set_casino_self_limit(?::uuid, ?::bigint, ?::bigint, ?::timestamptz)")
                .param(actor).param(dailyBet).param(dailyLoss).param(lockedUntil).query().listOfRows());
    }

    public Map<String, Object> clock() {
        return read(() -> jdbc.sql("SELECT c.policy_version, c.day_index::text AS day_index, c.week_index::text AS week_index, c.day_of_week, "
                        + "c.real_seconds_per_day, c.game_days_per_week, "
                        + "to_char(c.day_started_at AT TIME ZONE 'UTC', " + ISO + ") AS day_started_at, "
                        + "to_char(c.day_ends_at AT TIME ZONE 'UTC', " + ISO + ") AS day_ends_at, "
                        + "to_char(c.week_started_at AT TIME ZONE 'UTC', " + ISO + ") AS week_started_at, "
                        + "to_char(c.week_ends_at AT TIME ZONE 'UTC', " + ISO + ") AS week_ends_at "
                        + "FROM public.server_game_clock() AS c")
                .query().listOfRows().stream().findFirst().orElseThrow(() -> unavailable("CASINO_CLOCK_MISSING")));
    }

    // ---- terms and fairness (NestJS CasinoController: each asks the switch first) ----

    private static final String TERMS_COLUMNS = "terms.enabled, terms.min_stake::text AS min_stake, terms.max_stake::text AS max_stake, "
            + "terms.daily_stake_limit::text AS daily_stake_limit, terms.daily_loss_limit::text AS daily_loss_limit, "
            + "terms.daily_stake_used::text AS daily_stake_used, terms.daily_loss_used::text AS daily_loss_used, "
            + "terms.remaining_stake::text AS remaining_stake, terms.remaining_loss::text AS remaining_loss, "
            + "terms.win_probability_ppm, terms.payout_multiplier_ppm, terms.house_edge_ppm, "
            + "terms.worst_case_loss::text AS worst_case_loss, terms.net_win_at_max::text AS net_win_at_max";

    /** Closed, paused or unreadable switch: the NestJS refusal, before any terms are read. */
    public void requireOpen() {
        String state = switchState();
        if ("open".equals(state)) return;
        if ("unknown".equals(state)) throw unavailable("CASINO_SOURCE_UNAVAILABLE");
        throw closed(state);
    }

    public Map<String, Object> coinTerms(UUID actor) {
        requireOpen();
        return read(() -> shape(jdbc.sql("SELECT " + TERMS_COLUMNS + " FROM public.casino_coin_terms(?::uuid) AS terms")
                .param(actor).query().listOfRows()).stream().findFirst().orElseThrow(() -> unavailable("CASINO_TERMS_MISSING")));
    }

    public Map<String, Object> coinFairness() {
        requireOpen();
        return read(() -> shape(jdbc.sql("SELECT disclosure.win_probability_ppm, trial.trial_id::text AS trial_id, trial.trials::text AS trials, "
                        + "trial.heads::text AS heads, trial.expected_win_probability_ppm, trial.observed_win_probability_ppm, "
                        + "trial.z_score::text AS z_score, trial.tolerance_sigma::text AS tolerance_sigma, trial.created_at "
                        + "FROM (SELECT public.casino_coin_win_probability_ppm() AS win_probability_ppm) AS disclosure "
                        + "LEFT JOIN LATERAL public.casino_latest_qualifying_distribution_trial() AS trial ON true")
                .query().listOfRows()).stream().findFirst().orElseThrow(() -> unavailable("CASINO_FAIRNESS_MISSING")));
    }

    public List<Map<String, Object>> gameTerms(UUID actor) {
        requireOpen();
        return read(() -> shape(jdbc.sql("SELECT terms.game, " + TERMS_COLUMNS + " FROM public.casino_game_terms(?::uuid) AS terms")
                .param(actor).query().listOfRows()));
    }

    public List<Map<String, Object>> diceFairness() {
        requireOpen();
        return read(() -> shape(jdbc.sql("SELECT fairness.game, fairness.win_probability_ppm, fairness.trial_id::text AS trial_id, "
                        + "fairness.trials::text AS trials, fairness.wins::text AS wins, fairness.expected_win_probability_ppm, "
                        + "fairness.observed_win_probability_ppm, fairness.z_score::text AS z_score, fairness.chi_square::text AS chi_square, "
                        + "fairness.tolerance_chi_square::text AS tolerance_chi_square, fairness.created_at "
                        + "FROM public.casino_dice_fairness() AS fairness")
                .query().listOfRows()));
    }

    private static List<Map<String, Object>> shape(List<Map<String, Object>> rows) {
        return rows.stream().map(com.moneyverse.api.domain.earlygame.controller.EarlyGameReadsController::nodeShape).toList();
    }

    // ---- internals ----

    private Map<String, Object> play(String sql, Object... params) {
        return write(() -> {
            var spec = jdbc.sql(sql);
            for (Object p : params) spec = spec.param(p);
            return spec.query().listOfRows().stream().findFirst().orElseThrow(() -> unavailable("CASINO_RECEIPT_MISSING"));
        });
    }

    private interface Call<T> { T get(); }

    private static <T> T read(Call<T> call) {
        try { return call.get(); }
        catch (ResponseStatusException e) { throw e; }
        catch (RuntimeException e) { throw translate(e); }
    }

    private <T> T write(Call<T> call) {
        try { return call.get(); }
        catch (ResponseStatusException e) { throw e; }
        catch (RuntimeException e) {
            ResponseStatusException mapped = translate(e);
            if (mapped.getStatusCode() == HttpStatus.CONFLICT) {
                String state = switchState();
                // An unreadable state proves nothing about closure: keep the rule refusal (Gemini review, round 3).
                if (!"open".equals(state) && !"unknown".equals(state)) throw closed(state);
            }
            throw mapped;
        }
    }

    String switchState() {
        try {
            return jdbc.sql("SELECT public.feature_switch_state('casino')::text").query(String.class).optional().orElse("unknown");
        } catch (RuntimeException e) {
            return "unknown";
        }
    }

    static ResponseStatusException closed(String state) {
        return switch (state) {
            case "paused" -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "casino_paused");
            case "safe_mode" -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "casino_safe_mode");
            default -> new ResponseStatusException(HttpStatus.FORBIDDEN, "casino_disabled");
        };
    }

    /** Same meaning as the NestJS mapping: rule refusal 409 (with a code), caller refusal 403, anything else 503. */
    static ResponseStatusException translate(RuntimeException e) {
        logDbFailure("casino", e);
        Throwable cause = NestedExceptionUtils.getMostSpecificCause(e);
        if (cause instanceof SQLException sql && sql.getSQLState() != null) {
            String state = sql.getSQLState();
            String message = sql.getMessage() == null ? "" : sql.getMessage();
            if ("28000".equals(state) || ("42501".equals(state) && !message.startsWith("permission denied for"))) {
                return new ResponseStatusException(HttpStatus.FORBIDDEN, "casino_refused_for_member");
            }
            if (RULE_REFUSALS.contains(state)) return new ResponseStatusException(HttpStatus.CONFLICT, ruleCode(message));
        }
        return unavailable("CASINO_SOURCE_UNAVAILABLE");
    }

    static String ruleCode(String detail) {
        if (detail.contains("daily stake limit reached")) return "casino_daily_stake_limit_reached";
        if (detail.contains("daily loss limit reached")) return "casino_daily_loss_limit_reached";
        if (detail.contains("your own daily stake limit")) return "casino_self_stake_limit_reached";
        if (detail.contains("your own daily loss limit")) return "casino_self_loss_limit_reached";
        if (detail.contains("locked yourself out")) return "casino_self_excluded";
        return "casino_play_not_accepted";
    }

    private static ResponseStatusException unavailable(String code) {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, code);
    }

    /** Logs the cause of a refused/unavailable DB call (SQLSTATE + message, no parameters). */
    static void logDbFailure(String where, Throwable e) {
        Throwable c = org.springframework.core.NestedExceptionUtils.getMostSpecificCause(e);
        String state = c instanceof java.sql.SQLException sql ? sql.getSQLState() : "-";
        log.warn("[{}] db call failed: {} sqlstate={} {}", where, c.getClass().getSimpleName(), state, String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
    }
}
