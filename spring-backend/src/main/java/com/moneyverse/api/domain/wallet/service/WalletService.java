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
        String bal = "100000";
        try {
            BigDecimal b = jdbcTemplate.queryForObject(
                "SELECT balance_wld FROM wallets WHERE user_id = ?::uuid",
                BigDecimal.class,
                userId
            );
            if (b != null) bal = b.toPlainString();
        } catch (Exception ignored) {}

        return new WalletOverview(bal, "0", "0", "WLD", userId, Collections.emptyList());
    }

    @Transactional
    public Map<String, Object> transfer(String fromUserId, String toUserId, Long amountWld, String memo) {
        if (amountWld == null || amountWld <= 0) {
            throw new IllegalArgumentException("amountWld must be greater than 0");
        }
        if (fromUserId.equals(toUserId)) {
            throw new IllegalArgumentException("자신에게는 이체할 수 없습니다.");
        }

        // 송금자 잔액 차감
        int updated = jdbcTemplate.update("""
            UPDATE wallets 
            SET balance_wld = balance_wld - ?, updated_at = NOW() 
            WHERE user_id = ?::uuid AND balance_wld >= ?
            """, amountWld, fromUserId, amountWld);

        if (updated == 0) {
            throw new IllegalStateException("지갑 잔액이 부족합니다.");
        }

        // 수신자 잔액 증액 (없으면 생성)
        jdbcTemplate.update("""
            INSERT INTO wallets (id, user_id, balance_wld, created_at, updated_at)
            VALUES (gen_random_uuid(), ?::uuid, ?, NOW(), NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET balance_wld = wallets.balance_wld + EXCLUDED.balance_wld,
                          updated_at = NOW()
            """, toUserId, amountWld);

        String txId = UUID.randomUUID().toString();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("txId", txId);
        res.put("fromUserId", fromUserId);
        res.put("toUserId", toUserId);
        res.put("amountWld", amountWld);
        res.put("message", "P2P 지갑 전송이 안전하게 완료되었습니다.");
        return res;
    }
}
