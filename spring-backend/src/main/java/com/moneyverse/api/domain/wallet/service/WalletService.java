package com.moneyverse.api.domain.wallet.service;

import com.moneyverse.api.domain.wallet.dto.WalletDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);
    private final JdbcTemplate jdbcTemplate;

    public WalletService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public WalletOverview getOverview(String userId) {
        UUID uid;
        try {
            uid = UUID.fromString(userId.trim());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid wallet owner identifier");
        }

        BigDecimal cashBalance = BigDecimal.ZERO;
        BigDecimal bankBalance = BigDecimal.ZERO;
        Set<String> verifiedAccountTypes = new HashSet<>();

        try {
            String sql = """
                SELECT a.account_type, b.available_amount AS amount
                FROM accounts a
                LEFT JOIN account_balances b ON a.id = b.account_id
                WHERE a.owner_user_id = ?
            """;
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, uid);
            for (Map<String, Object> r : rows) {
                String type = String.valueOf(r.get("account_type"));
                if (!"USER_CASH".equals(type) && !"USER_BANK".equals(type)) continue;
                // A missing balance row is not proof of a 0-WLD balance.
                Object reportedAmount = r.get("amount");
                if (reportedAmount == null) throw new IllegalStateException("missing balance proof");
                BigDecimal amount = new BigDecimal(String.valueOf(reportedAmount));
                if (!verifiedAccountTypes.add(type)) throw new IllegalStateException("duplicate wallet account type");
                if ("USER_CASH".equals(type)) cashBalance = amount;
                else bankBalance = amount;
            }
        } catch (Exception e) {
            log.warn("[WalletService] Authoritative wallet balance query unavailable");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "wallet balance source unavailable", e);
        }
        if (!verifiedAccountTypes.containsAll(Set.of("USER_CASH", "USER_BANK"))) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "wallet ownership/balance not verified");
        }

        BigDecimal total = cashBalance.add(bankBalance);

        // Fetch recent postings with transaction details
        List<Map<String, Object>> txs = new ArrayList<>();
        try {
            String txSql = """
                SELECT lp.id, lp.amount, lp.direction::text AS direction, lp.created_at,
                       COALESCE(lt.type, 'TRANSFER') AS tx_type
                FROM ledger_postings lp
                JOIN accounts a ON lp.account_id = a.id
                LEFT JOIN ledger_transactions lt ON lp.transaction_id = lt.id
                WHERE a.owner_user_id = ?
                ORDER BY lp.created_at DESC
                LIMIT 10
            """;
            txs = jdbcTemplate.queryForList(txSql, uid);
        } catch (Exception e) {
            log.warn("[WalletService] Authoritative wallet postings query unavailable");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "wallet postings source unavailable", e);
        }

        return new WalletOverview(
                total.toPlainString(),
                cashBalance.toPlainString(),
                bankBalance.toPlainString(),
                "WLD",
                uid.toString(),
                txs
        );
    }

    /** Legacy direct transfer has no replay-stable request key; never post twice on retry. */
    public Map<String, Object> transfer(String fromUserId, String toUserId, Long amountWld, String memo) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "wallet transfer requires a verified idempotency receipt key");
    }

    @Transactional
    public Map<String, Object> transferWithIdempotencyKey(
            String fromUserId, String toUserId, Long amountWld, String memo, UUID idempotencyKey) {
        if (idempotencyKey == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Idempotency-Key UUID required");
        }
        if (amountWld == null || amountWld <= 0) {
            throw new IllegalArgumentException("이체 금액은 1 WLD 이상이어야 합니다.");
        }
        if (fromUserId.equals(toUserId)) {
            throw new IllegalArgumentException("자신에게는 이체할 수 없습니다.");
        }

        UUID fromUid;
        UUID toUid;
        try {
            fromUid = UUID.fromString(fromUserId.trim());
            toUid = UUID.fromString(toUserId.trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("유효하지 않은 유저 식별자 형식입니다.");
        }

        // Key must be provided by the authenticated caller; retries reuse the same key.
        try {
            String sql = "SELECT public.economy_transfer(?::uuid, ?::uuid, ?::uuid, ?::numeric)";
            UUID txId = jdbcTemplate.queryForObject(sql, UUID.class, idempotencyKey, fromUid, toUid, BigDecimal.valueOf(amountWld));

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            if (txId == null) throw new IllegalStateException("missing canonical posting receipt");
            res.put("txId", txId.toString());
            res.put("fromUserId", fromUserId);
            res.put("toUserId", toUserId);
            res.put("amount", amountWld);
            res.put("currency", "WLD");
            res.put("memo", memo != null ? memo : "");
            res.put("message", "P2P 불변 복식부기 원장 이체가 성공적으로 집행되었습니다.");
            return res;
        } catch (Exception e) {
            log.warn("[WalletService] canonical economy transfer unavailable; no success receipt");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "canonical transfer receipt unavailable", e);
        }
    }
}
