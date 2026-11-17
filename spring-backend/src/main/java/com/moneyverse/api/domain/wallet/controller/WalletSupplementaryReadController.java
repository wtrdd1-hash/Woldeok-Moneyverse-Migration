package com.moneyverse.api.domain.wallet.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Owner-bound read-only contracts for the legacy Next wallet page. */
@RestController
public class WalletSupplementaryReadController {
    private final UserAuthService auth;
    private final JdbcTemplate jdbc;

    public WalletSupplementaryReadController(UserAuthService auth, JdbcTemplate jdbc) {
        this.auth = auth;
        this.jdbc = jdbc;
    }

    @GetMapping("/api/v1/bank/loans")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> loans(HttpServletRequest request) {
        UUID owner = owner(request);
        try {
            List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM public.bank_my_loans(?::uuid)", owner);
            List<Map<String, Object>> loans = new ArrayList<>();
            for (Map<String, Object> row : rows) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("loanId", UUID.fromString(required(row.get("loan_id"))).toString());
                entry.put("principalAmount", amount(row.get("principal_amount"), true));
                entry.put("interestAmount", amount(row.get("interest_amount"), false));
                entry.put("outstandingAmount", amount(row.get("outstanding_amount"), false));
                String status = required(row.get("status"));
                if (!List.of("active", "repaid", "overdue").contains(status)) throw unavailable();
                entry.put("status", status);
                entry.put("issuedAt", timestamp(row.get("issued_at")));
                entry.put("repaidAt", row.get("repaid_at") == null ? null : timestamp(row.get("repaid_at")));
                loans.add(entry);
            }
            return response(Map.of("loans", loans));
        } catch (DataAccessException | IllegalArgumentException error) {
            throw unavailable();
        }
    }

    @GetMapping("/api/v1/rewards/availability")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> availability(HttpServletRequest request) {
        UUID owner = owner(request);
        try {
            List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM public.wallet_reward_availability(?::uuid)", owner);
            if (rows.size() != 1) throw unavailable();
            Map<String, Object> row = rows.get(0);
            if (!(row.get("daily_available") instanceof Boolean daily)
                    || !(row.get("work_available") instanceof Boolean work)) throw unavailable();
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("dailyAvailable", daily);
            result.put("workAvailable", work);
            result.put("dailyNextEligibleAt", row.get("daily_next_eligible_at") == null ? null : timestamp(row.get("daily_next_eligible_at")));
            result.put("workNextEligibleAt", row.get("work_next_eligible_at") == null ? null : timestamp(row.get("work_next_eligible_at")));
            return response(result);
        } catch (DataAccessException | IllegalArgumentException error) {
            throw unavailable();
        }
    }

    private UUID owner(HttpServletRequest request) {
        return auth.resolveSession(request).filter(SessionInfo::isSignedIn)
            .map(SessionInfo::getUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "login required"));
    }

    private static String required(Object value) {
        if (value == null || value.toString().isBlank()) throw unavailable();
        return value.toString();
    }

    private static String amount(Object value, boolean positive) {
        String raw = required(value);
        if (!raw.matches("(?:0|[1-9][0-9]*)") || (positive && new BigInteger(raw).signum() <= 0)) {
            throw unavailable();
        }
        return raw;
    }

    private static String timestamp(Object value) {
        if (value instanceof Timestamp ts) return ts.toInstant().toString();
        if (value instanceof Instant instant) return instant.toString();
        if (value instanceof java.time.OffsetDateTime dateTime) return dateTime.toInstant().toString();
        String raw = required(value);
        try { return Instant.parse(raw).toString(); }
        catch (Exception error) { throw unavailable(); }
    }

    private static ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "verified wallet source unavailable");
    }

    private static ResponseEntity<Map<String, Object>> response(Map<String, Object> body) {
        return ResponseEntity.ok().header("Cache-Control", "private, no-store")
            .header("X-Robots-Tag", "noindex, nofollow")
            .header("Referrer-Policy", "no-referrer")
            .body(body);
    }
}
