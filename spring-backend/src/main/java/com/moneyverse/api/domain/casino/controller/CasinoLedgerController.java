package com.moneyverse.api.domain.casino.controller;

import com.moneyverse.api.domain.casino.service.CasinoLedgerService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Casino plays and the member's own limits (QA 2026-11-25: 404 in Spring).
 * Contract from the NestJS CasinoController; choices are checked per game here
 * and again by the DB, which is the authority on outcome and settlement.
 */
@Tag(name = "Casino ledger", description = "Coin, dice and theme plays via casino_play_*; history, self-limit, server clock")
@RestController
@RequestMapping({"/api/v1/casino", "/api/casino"})
public class CasinoLedgerController {
    private static final long MAX_SAFE = 9_007_199_254_740_991L;
    private static final Set<String> FACES = Set.of("heads", "tails");
    private static final Map<String, Set<String>> DICE = Map.of(
            "dice_parity", Set.of("odd", "even"),
            "dice_number", Set.of("1", "2", "3", "4", "5", "6"));
    private static final Map<String, Set<String>> THEME = Map.of(
            "hilo_20", Set.of("high", "low"),
            "treasure_4", Set.of("1", "2", "3", "4"),
            "gem_5", Set.of("ruby", "emerald", "sapphire", "topaz", "amethyst"),
            "wheel_20", Set.of("blue", "gold", "violet"));

    private final CasinoLedgerService casino;
    private final MemberApiGuard guard;

    public CasinoLedgerController(CasinoLedgerService casino, MemberApiGuard guard) {
        this.casino = casino;
        this.guard = guard;
    }

    @PostMapping("/coin/plays")
    @Operation(summary = "Stake WLD on one coin toss (session, CSRF, idempotency key)")
    public ResponseEntity<?> coin(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        String choice = text(body, "choice");
        Long stake = stake(body, "stake", false);
        if (choice == null || !FACES.contains(choice) || stake == null) return invalid("the choice must be heads or tails and the stake a whole number above zero");
        UUID key = guard.idempotencyKey(text(body, "idempotencyKey"));
        return privateOk(casino.playCoin(key, actor, choice, stake));
    }

    @PostMapping("/dice/plays")
    @Operation(summary = "One dice play (dice_parity or dice_number)")
    public ResponseEntity<?> dice(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        String game = text(body, "game"), choice = text(body, "choice");
        Long stake = stake(body, "stake", false);
        if (game == null || !DICE.containsKey(game) || choice == null || !DICE.get(game).contains(choice) || stake == null) {
            return invalid("the choice does not belong to that dice game, or the stake is not a whole number above zero");
        }
        UUID key = guard.idempotencyKey(text(body, "idempotencyKey"));
        return privateOk(casino.playDice(key, actor, game, choice, stake));
    }

    @PostMapping("/theme/plays")
    @Operation(summary = "One theme game play (hilo_20, treasure_4, gem_5, wheel_20)")
    public ResponseEntity<?> theme(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        String game = text(body, "game"), choice = text(body, "choice");
        Long stake = stake(body, "stake", false);
        if (game == null || !THEME.containsKey(game) || choice == null || !THEME.get(game).contains(choice) || stake == null) {
            return invalid("the choice does not belong to that theme game, or the stake is not a whole number above zero");
        }
        UUID key = guard.idempotencyKey(text(body, "idempotencyKey"));
        return privateOk(casino.playTheme(key, actor, game, choice, stake));
    }

    @GetMapping("/coin/terms")
    @Operation(summary = "Coin game odds, stake limits and today's use (refused while the casino is closed)")
    public ResponseEntity<?> coinTerms(HttpServletRequest request) {
        return privateOk(casino.coinTerms(guard.actor(request)));
    }

    @GetMapping("/coin/fairness")
    @Operation(summary = "Disclosed coin win probability and the trial evidencing it")
    public ResponseEntity<?> coinFairness() {
        return privateOk(casino.coinFairness());
    }

    @GetMapping("/games/terms")
    @Operation(summary = "Every game's odds, payout and remaining exposure for today")
    public ResponseEntity<?> gameTerms(HttpServletRequest request) {
        return privateOk(casino.gameTerms(guard.actor(request)));
    }

    @GetMapping("/dice/fairness")
    @Operation(summary = "Each dice game's disclosed odds and the trial evidencing them")
    public ResponseEntity<?> diceFairness() {
        return privateOk(casino.diceFairness());
    }

    @GetMapping("/history")
    @Operation(summary = "The member's recent plays")
    public ResponseEntity<?> history(HttpServletRequest request) {
        return privateOk(casino.history(guard.actor(request)));
    }

    @GetMapping("/self-limit")
    @Operation(summary = "The member's own daily caps and lock")
    public ResponseEntity<?> selfLimit(HttpServletRequest request) {
        return privateOk(casino.selfLimit(guard.actor(request)));
    }

    @PutMapping("/self-limit")
    @Operation(summary = "Set the member's own daily caps and optional lock (0 = unbound)")
    public ResponseEntity<?> setSelfLimit(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        Long bet = stake(body, "dailyBetLimit", true);
        Long loss = stake(body, "dailyLossLimit", true);
        Object rawLock = body == null ? null : body.get("lockedUntil");
        String lock = null;
        if (rawLock != null) {
            if (!(rawLock instanceof String s)) return invalid("the lock-until moment must be an ISO 8601 timestamp");
            try { OffsetDateTime.parse(s); lock = s; }
            catch (DateTimeParseException e) { return invalid("the lock-until moment must be an ISO 8601 timestamp"); }
        }
        if (bet == null || loss == null) return invalid("limits must be whole numbers of WLD, zero or above");
        casino.setSelfLimit(actor, bet, loss, lock);
        Map<String, Object> echo = new LinkedHashMap<>();
        echo.put("daily_bet_limit", String.valueOf(bet));
        echo.put("daily_loss_limit", String.valueOf(loss));
        echo.put("locked_until", lock);
        return privateOk(echo);
    }

    @GetMapping("/clock")
    @Operation(summary = "The authoritative accelerated server day and week")
    public ResponseEntity<?> clock() {
        return ResponseEntity.ok(casino.clock());
    }

    // ---- helpers ----

    private static String text(Map<String, Object> body, String name) {
        return body != null && body.get(name) instanceof String s ? s : null;
    }

    /** A JSON integer (not a string, not a fraction) within the JS safe range; zero allowed only for limits. */
    private static Long stake(Map<String, Object> body, String name, boolean zeroAllowed) {
        Object v = body == null ? null : body.get(name);
        if (!(v instanceof Integer || v instanceof Long)) return null;
        long n = ((Number) v).longValue();
        if (n > MAX_SAFE || n < (zeroAllowed ? 0 : 1)) return null;
        return n;
    }

    private static ResponseEntity<?> invalid(String message) {
        return ResponseEntity.badRequest().body(Map.of("code", "CASINO_INPUT_INVALID", "message", message));
    }

    private static ResponseEntity<?> privateOk(Object body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(body);
    }
}
