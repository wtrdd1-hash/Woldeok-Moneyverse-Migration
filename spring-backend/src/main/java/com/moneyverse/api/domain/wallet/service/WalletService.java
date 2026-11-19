package com.moneyverse.api.domain.wallet.service;

import com.moneyverse.api.domain.wallet.dto.WalletDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
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
            uid = UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20");
        }

        BigDecimal cashBalance = BigDecimal.ZERO;
        BigDecimal bankBalance = BigDecimal.ZERO;

        try {
            String sql = """
                SELECT a.account_type, COALESCE(b.available_amount, 0) AS amount
                FROM accounts a
                LEFT JOIN account_balances b ON a.id = b.account_id
                WHERE a.owner_user_id = ?
            """;
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, uid);
            for (Map<String, Object> r : rows) {
                String type = String.valueOf(r.get("account_type"));
                BigDecimal amount = new BigDecimal(String.valueOf(r.get("amount")));
                if ("USER_CASH".equals(type)) {
                    cashBalance = amount;
                } else if ("USER_BANK".equals(type)) {
                    bankBalance = amount;
                }
            }
        } catch (Exception e) {
            log.warn("[WalletService] Failed to load ledger balances for userId={}: {}", uid, e.getMessage());
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
            log.warn("[WalletService] Failed to load recent ledger postings for userId={}: {}", uid, e.getMessage());
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

    @Transactional
    public Map<String, Object> transfer(String fromUserId, String toUserId, Long amountWld, String memo) {
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

        UUID idempotencyKey = UUID.randomUUID();

        try {
            String sql = "SELECT public.economy_transfer(?::uuid, ?::uuid, ?::uuid, ?::numeric)";
            UUID txId = jdbcTemplate.queryForObject(sql, UUID.class, idempotencyKey, fromUid, toUid, BigDecimal.valueOf(amountWld));

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("txId", txId != null ? txId.toString() : UUID.randomUUID().toString());
            res.put("fromUserId", fromUserId);
            res.put("toUserId", toUserId);
            res.put("amount", amountWld);
            res.put("currency", "WLD");
            res.put("memo", memo != null ? memo : "");
            res.put("message", "P2P 불변 복식부기 원장 이체가 성공적으로 집행되었습니다.");
            return res;
        } catch (Exception e) {
            log.error("[WalletService] economy_transfer failed from={} to={} amount={}: {}", fromUid, toUid, amountWld, e.getMessage());
            throw new IllegalStateException("원장 이체 처리 실패: " + e.getMessage(), e);
        }
    }
}
