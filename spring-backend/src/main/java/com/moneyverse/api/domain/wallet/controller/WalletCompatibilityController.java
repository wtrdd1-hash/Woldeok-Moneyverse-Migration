package com.moneyverse.api.domain.wallet.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Read-only legacy Next.js wallet contract. Financial values come only from owner-bound ledger accounts. */
@RestController
public class WalletCompatibilityController {
    private static final String BALANCES_SQL = """
        SELECT account.account_type::text AS account_type,
               balance.available_amount::text AS available_amount,
               to_char(balance.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS updated_at
        FROM public.accounts AS account
        JOIN public.account_balances AS balance ON balance.account_id = account.id
        WHERE account.owner_user_id = ?
          AND account.status = 'active'::public.account_status
          AND account.currency = 'WLD'
          AND account.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
        ORDER BY account.account_type ASC
        """;

    private static final String TRANSACTIONS_SQL = """
        SELECT ledger_transaction.id::text AS transaction_id,
               ledger_transaction.type,
               to_char(ledger_transaction.created_at AT TIME ZONE 'UTC',
                       'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS occurred_at,
               COALESCE(SUM(CASE posting.direction
                   WHEN 'debit'::public.posting_direction THEN posting.amount
                   ELSE -posting.amount END), 0)::text AS net_amount,
               COALESCE(SUM(CASE WHEN account.account_type = 'USER_CASH'::public.account_type
                   THEN CASE posting.direction WHEN 'debit'::public.posting_direction THEN posting.amount
                   ELSE -posting.amount END ELSE 0 END), 0)::text AS cash_delta,
               COALESCE(SUM(CASE WHEN account.account_type = 'USER_BANK'::public.account_type
                   THEN CASE posting.direction WHEN 'debit'::public.posting_direction THEN posting.amount
                   ELSE -posting.amount END ELSE 0 END), 0)::text AS bank_delta
        FROM public.ledger_transactions AS ledger_transaction
        JOIN public.ledger_postings AS posting ON posting.transaction_id = ledger_transaction.id
        JOIN public.accounts AS account ON account.id = posting.account_id
        WHERE account.owner_user_id = ?
          AND account.currency = 'WLD'
          AND account.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
        GROUP BY ledger_transaction.id, ledger_transaction.type, ledger_transaction.created_at
        ORDER BY ledger_transaction.created_at DESC, ledger_transaction.id DESC
        LIMIT ?
        """;

    private final UserAuthService authService;
    private final JdbcTemplate jdbc;

    public WalletCompatibilityController(UserAuthService authService, JdbcTemplate jdbc) {
        this.authService = authService;
        this.jdbc = jdbc;
    }

    @GetMapping("/api/v1/wallet")
    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public ResponseEntity<Map<String, Object>> overview(
            HttpServletRequest request,
            @RequestParam(value = "recent", required = false) String recent) {
        UUID owner = authService.resolveSession(request)
            .filter(SessionInfo::isSignedIn)
            .map(SessionInfo::getUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "login required"));

        if (request.getParameterValues("recent") != null && request.getParameterValues("recent").length > 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "duplicate recent is not allowed");
        }
        int limit = 10;
        if (recent != null) {
            if (!recent.matches("(?:[1-9]|[1-4][0-9]|50)")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "recent must be 1..50");
            }
            limit = Integer.parseInt(recent);
        }

        try {
            List<Map<String, Object>> rows = jdbc.queryForList(BALANCES_SQL, owner);
            if (rows.size() != 2) throw unavailable();
            Map<String, Object> cash = null;
            Map<String, Object> bank = null;
            BigInteger cashAmount = null;
            BigInteger bankAmount = null;
            for (Map<String, Object> row : rows) {
                String amountText = canonicalAmount(row.get("available_amount"), false);
                Map<String, Object> wallet = Map.of(
                    "availableAmount", amountText,
                    "updatedAt", nonBlank(row.get("updated_at")));
                if ("USER_CASH".equals(row.get("account_type")) && cash == null) {
                    cash = wallet;
                    cashAmount = new BigInteger(amountText);
                } else if ("USER_BANK".equals(row.get("account_type")) && bank == null) {
                    bank = wallet;
                    bankAmount = new BigInteger(amountText);
                } else {
                    throw unavailable();
                }
            }
            if (cash == null || bank == null) throw unavailable();

            List<Map<String, Object>> transactions = jdbc.queryForList(TRANSACTIONS_SQL, owner, limit + 1);
            boolean hasMore = transactions.size() > limit;
            List<Map<String, Object>> recentTransactions = new ArrayList<>();
            for (int i = 0; i < Math.min(limit, transactions.size()); i++) {
                Map<String, Object> row = transactions.get(i);
                String net = canonicalAmount(row.get("net_amount"), true);
                String cashDelta = canonicalAmount(row.get("cash_delta"), true);
                String bankDelta = canonicalAmount(row.get("bank_delta"), true);
                BigInteger netNum = new BigInteger(net);
                if (!new BigInteger(cashDelta).add(new BigInteger(bankDelta)).equals(netNum)) {
                    throw unavailable();
                }
                String type = nonBlank(row.get("type"));
                recentTransactions.add(Map.of(
                    "transactionId", UUID.fromString(nonBlank(row.get("transaction_id"))).toString(),
                    "type", type,
                    "label", type.replace('_', ' '),
                    "netAmount", net,
                    "cashDelta", cashDelta,
                    "bankDelta", bankDelta,
                    "direction", netNum.signum() > 0 ? "in" : netNum.signum() < 0 ? "out" : "neutral",
                    "occurredAt", nonBlank(row.get("occurred_at"))
                ));
            }

            Map<String, Object> balances = new LinkedHashMap<>();
            balances.put("currency", "WLD");
            balances.put("cash", cash);
            balances.put("bank", bank);
            balances.put("totalAvailableAmount", cashAmount.add(bankAmount).toString());
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("userId", owner.toString());
            body.put("balances", balances);
            body.put("recentTransactions", recentTransactions);
            body.put("recentTransactionsHasMore", hasMore);
            return ResponseEntity.ok()
                .header("Cache-Control", "private, no-store")
                .header("X-Robots-Tag", "noindex, nofollow")
                .header("Referrer-Policy", "no-referrer")
                .body(body);
        } catch (DataAccessException | IllegalArgumentException error) {
            throw unavailable();
        }
    }

    private static String nonBlank(Object value) {
        if (value == null || value.toString().isBlank()) throw unavailable();
        return value.toString();
    }

    private static String canonicalAmount(Object value, boolean signed) {
        String text = nonBlank(value);
        if (!text.matches(signed ? "(?:0|[1-9][0-9]*|-[1-9][0-9]*)" : "(?:0|[1-9][0-9]*)")) {
            throw unavailable();
        }
        return text;
    }

    private static ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "verified wallet ledger unavailable");
    }
}
