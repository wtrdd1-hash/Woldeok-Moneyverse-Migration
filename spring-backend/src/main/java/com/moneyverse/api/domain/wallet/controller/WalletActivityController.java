package com.moneyverse.api.domain.wallet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.common.time.JsTime;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.*;
import java.util.*;
import java.util.function.Supplier;
import java.util.regex.Pattern;

/**
 * The member's wallet history, 50 per page (NestJS WalletService.activityPage; signed-in sweep
 * 2026-11-25: 404 in Spring, so /wallet/activity always said "지금은 기록을 불러올 수 없어요").
 * Owner pocket legs only (USER_CASH, USER_BANK). The cursor is an HMAC-signed, owner-bound,
 * filter-bound token that expires (60 min rolling, 15 min calendar); a forged or foreign cursor
 * is 400, an expired calendar cursor 410. The signing key lives only in this process.
 */
@RestController
public class WalletActivityController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(WalletActivityController.class);
    private static final int PAGE = 50;
    private static final ZoneOffset KST = ZoneOffset.ofHours(9);
    private static final Pattern DAY = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}$");
    private static final Pattern MICROS = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{6}Z$");
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final String SQL = """
            SELECT t.id::text AS transaction_id, t.type, t.created_at,
                   to_char(t.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_at,
                   COALESCE(SUM(CASE p.direction WHEN 'debit'::public.posting_direction THEN p.amount ELSE -p.amount END), 0)::text AS net_amount,
                   COALESCE(SUM(CASE WHEN a.account_type = 'USER_CASH'::public.account_type THEN
                     CASE p.direction WHEN 'debit'::public.posting_direction THEN p.amount ELSE -p.amount END ELSE 0 END), 0)::text AS cash_delta,
                   COALESCE(SUM(CASE WHEN a.account_type = 'USER_BANK'::public.account_type THEN
                     CASE p.direction WHEN 'debit'::public.posting_direction THEN p.amount ELSE -p.amount END ELSE 0 END), 0)::text AS bank_delta
            FROM public.ledger_transactions AS t
            JOIN public.ledger_postings AS p ON p.transaction_id = t.id
            JOIN public.accounts AS a ON a.id = p.account_id
            WHERE a.owner_user_id = ?::uuid
              AND a.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
              AND t.created_at <= ?::timestamptz
              AND (?::timestamptz IS NULL OR t.created_at >= ?::timestamptz)
              AND (?::timestamptz IS NULL OR t.created_at < ?::timestamptz)
              AND (?::timestamptz IS NULL OR (t.created_at, t.id) < (?::timestamptz, ?::uuid))
            GROUP BY t.id, t.type, t.created_at
            HAVING (?::text IS NULL OR SIGN(COALESCE(SUM(
              CASE p.direction WHEN 'debit'::public.posting_direction THEN p.amount ELSE -p.amount END), 0))
              = CASE ?::text WHEN 'in' THEN 1 WHEN 'out' THEN -1 WHEN 'neutral' THEN 0 END)
            ORDER BY t.created_at DESC, t.id DESC
            LIMIT 51
            """;

    private final JdbcClient jdbc;
    private final MemberApiGuard guard;
    private final byte[] key;
    private final Supplier<Instant> clock;

    @org.springframework.beans.factory.annotation.Autowired
    public WalletActivityController(JdbcClient jdbc, MemberApiGuard guard) {
        this(jdbc, guard, newKey(), Instant::now);
    }

    WalletActivityController(JdbcClient jdbc, MemberApiGuard guard, byte[] key, Supplier<Instant> clock) {
        this.jdbc = jdbc;
        this.guard = guard;
        this.key = key;
        this.clock = clock;
    }

    record Range(String from, String to, Instant since, Instant before) {}

    record Cursor(String asOf, String afterAt, String afterId) {}

    @GetMapping({"/api/v1/wallet/activity", "/api/wallet/activity"})
    @Operation(summary = "The member's wallet history (owner pocket legs, 50 per page, signed cursor)")
    public ResponseEntity<?> activity(HttpServletRequest request,
                                      @RequestParam(value = "period", required = false, defaultValue = "all") String period,
                                      @RequestParam(value = "direction", required = false, defaultValue = "all") String direction,
                                      @RequestParam(value = "from", required = false) String from,
                                      @RequestParam(value = "to", required = false) String to,
                                      @RequestParam(value = "cursor", required = false) String cursor) {
        UUID owner = guard.actor(request);
        if (!Set.of("all", "7d", "30d").contains(period)) throw bad("WALLET_ACTIVITY_PERIOD_INVALID");
        if (!Set.of("all", "in", "out", "neutral").contains(direction)) throw bad("WALLET_ACTIVITY_DIRECTION_INVALID");
        Instant now = clock.get();
        Range range = range(from, to, now);
        if (range != null && !"all".equals(period)) throw bad("WALLET_ACTIVITY_RANGE_WITH_PERIOD");
        Cursor decoded = cursor == null || cursor.isEmpty() ? null : verify(cursor, owner, period, direction, range, now);
        Instant asOf = decoded == null ? now : Instant.parse(decoded.asOf());
        Instant since = range != null ? range.since() : "all".equals(period) ? null : asOf.minus(Duration.ofDays("7d".equals(period) ? 7 : 30));
        List<Map<String, Object>> rows;
        try {
            Timestamp sinceTs = since == null ? null : Timestamp.from(since);
            Timestamp beforeTs = range == null ? null : Timestamp.from(range.before());
            Timestamp afterTs = decoded == null ? null : Timestamp.from(Instant.parse(decoded.afterAt()));
            String afterId = decoded == null ? null : decoded.afterId();
            String dir = "all".equals(direction) ? null : direction;
            rows = jdbc.sql(SQL).param(owner).param(Timestamp.from(asOf))
                    .param(sinceTs).param(sinceTs).param(beforeTs).param(beforeTs)
                    .param(afterTs).param(afterTs).param(afterId).param(dir).param(dir)
                    .query().listOfRows();
        } catch (RuntimeException e) {
            Throwable c = NestedExceptionUtils.getMostSpecificCause(e);
            log.warn("[wallet-activity] db call failed: {} {}", c.getClass().getSimpleName(), String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "WALLET_ACTIVITY_UNAVAILABLE");
        }
        List<Map<String, Object>> transactions = new ArrayList<>();
        BigInteger cash = BigInteger.ZERO, bank = BigInteger.ZERO, net = BigInteger.ZERO;
        for (Map<String, Object> r : rows.subList(0, Math.min(PAGE, rows.size()))) {
            BigInteger n = new BigInteger(String.valueOf(r.get("net_amount")));
            BigInteger c = new BigInteger(String.valueOf(r.get("cash_delta")));
            BigInteger b = new BigInteger(String.valueOf(r.get("bank_delta")));
            if (!c.add(b).equals(n)) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "WALLET_POCKET_DELTA_MISMATCH");
            cash = cash.add(c); bank = bank.add(b); net = net.add(n);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("transactionId", r.get("transaction_id"));
            m.put("type", r.get("type"));
            m.put("label", WalletTransactionDetailController.label(String.valueOf(r.get("type"))));
            m.put("netAmount", n.toString());
            m.put("cashDelta", c.toString());
            m.put("bankDelta", b.toString());
            m.put("direction", n.signum() > 0 ? "in" : n.signum() < 0 ? "out" : "neutral");
            m.put("occurredAt", r.get("created_at") instanceof Timestamp t ? JsTime.iso(t.toInstant()) : null);
            transactions.add(m);
        }
        boolean hasMore = rows.size() > PAGE;
        String next = null;
        if (hasMore) {
            Map<String, Object> last = rows.get(PAGE - 1);
            String afterAt = String.valueOf(last.get("cursor_at"));
            if (!MICROS.matcher(afterAt).matches()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "WALLET_CURSOR_EVIDENCE_UNAVAILABLE");
            next = sign(owner, period, direction, range, JsTime.iso(asOf), afterAt, String.valueOf(last.get("transaction_id")));
        }
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("scope", "VISIBLE_PAGE_ONLY");
        summary.put("transactionCount", transactions.size());
        summary.put("cashDelta", cash.toString());
        summary.put("bankDelta", bank.toString());
        summary.put("netDelta", net.toString());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("transactions", transactions);
        out.put("hasMore", hasMore);
        out.put("nextCursor", next);
        out.put("asOf", JsTime.iso(asOf));
        out.put("pageSummary", summary);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(out);
    }

    static Range range(String from, String to, Instant now) {
        if (from == null && to == null) return null;
        if (from == null || to == null || !DAY.matcher(from).matches() || !DAY.matcher(to).matches()) throw bad("WALLET_ACTIVITY_RANGE_INVALID");
        LocalDate start, end;
        try { start = LocalDate.parse(from); end = LocalDate.parse(to); } catch (DateTimeException e) { throw bad("WALLET_ACTIVITY_RANGE_INVALID"); }
        long days = Duration.between(start.atStartOfDay(), end.atStartOfDay()).toDays() + 1;
        LocalDate todayKst = LocalDate.ofInstant(now, KST);
        if (days < 1 || days > 366 || end.isAfter(todayKst)) throw bad("WALLET_ACTIVITY_RANGE_INVALID");
        return new Range(from, to, start.atStartOfDay().toInstant(KST), end.plusDays(1).atStartOfDay().toInstant(KST));
    }

    String sign(UUID owner, String period, String direction, Range range, String asOf, String afterAt, String afterId) {
        Map<String, Object> data = new TreeMap<>();
        data.put("v", range == null ? 1 : 2);
        data.put("owner", owner.toString());
        data.put("period", period);
        data.put("direction", direction);
        if (range != null) { data.put("rangeFrom", range.from()); data.put("rangeTo", range.to()); }
        data.put("asOf", asOf);
        data.put("afterAt", afterAt);
        data.put("afterId", afterId);
        try {
            String body = Base64.getUrlEncoder().withoutPadding().encodeToString(JSON.writeValueAsBytes(data));
            return body + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(mac(body));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "WALLET_CURSOR_UNAVAILABLE");
        }
    }

    Cursor verify(String token, UUID owner, String period, String direction, Range range, Instant now) {
        if (token.length() > 2048) throw bad("WALLET_ACTIVITY_CURSOR_INVALID");
        String[] parts = token.split("\\.", -1);
        if (parts.length != 2) throw bad("WALLET_ACTIVITY_CURSOR_INVALID");
        byte[] actual;
        Map<?, ?> data;
        try {
            actual = Base64.getUrlDecoder().decode(parts[1]);
            if (!MessageDigest.isEqual(actual, mac(parts[0]))) throw bad("WALLET_ACTIVITY_CURSOR_INVALID");
            data = JSON.readValue(Base64.getUrlDecoder().decode(parts[0]), Map.class);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw bad("WALLET_ACTIVITY_CURSOR_INVALID");
        }
        boolean same = Objects.equals(data.get("v"), range == null ? 1 : 2)
                && owner.toString().equals(data.get("owner")) && period.equals(data.get("period")) && direction.equals(data.get("direction"))
                && Objects.equals(data.get("rangeFrom"), range == null ? null : range.from())
                && Objects.equals(data.get("rangeTo"), range == null ? null : range.to())
                && data.get("asOf") instanceof String && data.get("afterAt") instanceof String && data.get("afterId") instanceof String;
        if (!same) throw bad("WALLET_ACTIVITY_CURSOR_MISMATCH");
        String asOfText = (String) data.get("asOf"), afterAt = (String) data.get("afterAt"), afterId = (String) data.get("afterId");
        Instant asOf, after;
        try {
            UUID.fromString(afterId);
            asOf = Instant.parse(asOfText);
            after = Instant.parse(afterAt);
        } catch (RuntimeException e) {
            throw bad("WALLET_ACTIVITY_CURSOR_INVALID");
        }
        if (!MICROS.matcher(afterAt).matches() || asOf.isAfter(now) || after.isAfter(asOf)) throw bad("WALLET_ACTIVITY_CURSOR_INVALID");
        if (Duration.between(asOf, now).toMinutes() >= (range == null ? 60 : 15)) {
            if (range != null) throw new ResponseStatusException(HttpStatus.GONE, "WALLET_ACTIVITY_CURSOR_EXPIRED");
            throw bad("WALLET_ACTIVITY_CURSOR_INVALID");
        }
        return new Cursor(asOfText, afterAt, afterId);
    }

    private byte[] mac(String body) throws Exception {
        Mac m = Mac.getInstance("HmacSHA256");
        m.init(new SecretKeySpec(key, "HmacSHA256"));
        return m.doFinal(body.getBytes(StandardCharsets.US_ASCII));
    }

    private static byte[] newKey() {
        byte[] k = new byte[32];
        new SecureRandom().nextBytes(k);
        return k;
    }

    private static ResponseStatusException bad(String code) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, code);
    }
}
