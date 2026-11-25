package com.moneyverse.api.domain.wallet.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigInteger;
import java.sql.SQLException;
import java.util.*;

/**
 * Daily reward claim (planning APP_SPEC 3.2; real-flow test 2026-11-26: 404 in Spring, so the
 * home "오늘의 보상 받기" never paid). Ported from NestJS WalletController: session + CSRF +
 * idempotency key, one call to the journaled economy_claim_daily for the server game day; the
 * amount comes from the database, never the request. The legacy work faucet stays retired (410).
 */
@RestController
public class RewardClaimsController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RewardClaimsController.class);
    private static final Set<String> RULE_REFUSALS = Set.of("22023", "23505", "55000", "P0001");
    private final JdbcClient jdbc;
    private final MemberApiGuard guard;

    public RewardClaimsController(JdbcClient jdbc, MemberApiGuard guard) {
        this.jdbc = jdbc;
        this.guard = guard;
    }

    @PostMapping({"/api/v1/rewards/daily/claims", "/api/rewards/daily/claims"})
    @Operation(summary = "Claim today's reward (journaled; session, CSRF, idempotency key)")
    public ResponseEntity<?> claimDaily(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        UUID key = guard.idempotencyKey(body != null && body.get("idempotencyKey") instanceof String s ? s : null);
        Map<String, Object> r;
        try {
            r = jdbc.sql("SELECT transaction_id::text AS transaction_id, amount::text AS amount, replayed "
                            + "FROM public.economy_claim_daily(?::uuid, ?::uuid, public.server_game_day_key())")
                    .param(key).param(actor).query().listOfRows().stream().findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "DAILY_REWARD_RECEIPT_MISSING"));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (RuntimeException e) {
            throw translate(e);
        }
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(receipt(r));
    }

    @PostMapping({"/api/v1/rewards/work/claims", "/api/rewards/work/claims"})
    @Operation(summary = "Retired legacy work faucet; use professional work tasks", deprecated = true)
    public ResponseEntity<?> claimWork() {
        return ResponseEntity.status(HttpStatus.GONE).body(Map.of("code", "LEGACY_WORK_REWARD_RETIRED",
                "message", "legacy work reward retired; complete a professional task on /work"));
    }

    /** The NestJS receipt check: a UUID transaction, a positive whole amount, a boolean replay flag. */
    static Map<String, Object> receipt(Map<String, Object> r) {
        Object tx = r.get("transaction_id"), amount = r.get("amount"), replayed = r.get("replayed");
        try {
            UUID.fromString(String.valueOf(tx));
            if (new BigInteger(String.valueOf(amount)).signum() <= 0 || !(replayed instanceof Boolean)) throw new IllegalStateException();
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "DAILY_REWARD_RECEIPT_INVALID");
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("transactionId", tx);
        out.put("amount", String.valueOf(amount));
        out.put("replayed", replayed);
        return out;
    }

    private static ResponseStatusException translate(RuntimeException e) {
        Throwable c = NestedExceptionUtils.getMostSpecificCause(e);
        String state = c instanceof SQLException sql ? sql.getSQLState() : null;
        log.warn("[daily-reward] db call failed: {} sqlstate={} {}", c.getClass().getSimpleName(), state, String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
        if (state != null && RULE_REFUSALS.contains(state)) return new ResponseStatusException(HttpStatus.CONFLICT, "DAILY_REWARD_NOT_AVAILABLE");
        if ("28000".equals(state)) return new ResponseStatusException(HttpStatus.BAD_REQUEST, "DAILY_REWARD_REFUSED");
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "DAILY_REWARD_UNAVAILABLE");
    }
}
