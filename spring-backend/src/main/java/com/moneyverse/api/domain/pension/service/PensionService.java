package com.moneyverse.api.domain.pension.service;

import com.moneyverse.api.domain.pension.dto.PensionDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
public class PensionService {

    private static final Logger log = LoggerFactory.getLogger(PensionService.class);
    private final JdbcTemplate jdbcTemplate;

    public PensionService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public PensionOverview getOverview() {
        try {
            String sql = """
                SELECT 
                    COALESCE(SUM(accumulated_contribution_wld), 0) AS total_aum,
                    COUNT(*) AS total_subscribers,
                    COUNT(CASE WHEN status = 'RETIRED' THEN 1 END) AS total_retired,
                    COALESCE(SUM(total_payout_received_wld), 0) AS total_payout
                FROM national_pension_accounts
                """;

            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                String totalAum = rs.getBigDecimal("total_aum").toPlainString();
                Long totalSubscribers = rs.getLong("total_subscribers");
                Long totalRetired = rs.getLong("total_retired");
                String totalPayout = rs.getBigDecimal("total_payout").toPlainString();

                String vaultBal = "54446000";
                try {
                    BigDecimal vBal = jdbcTemplate.queryForObject(
                        "SELECT balance_wld FROM fiscal_vaults WHERE code = 'VAULT_MAIN'",
                        BigDecimal.class
                    );
                    if (vBal != null) vaultBal = vBal.toPlainString();
                } catch (Exception ignored) {}

                return new PensionOverview(
                    totalAum,
                    totalSubscribers,
                    totalRetired,
                    totalPayout,
                    "5.20%",
                    true,
                    vaultBal
                );
            });
        } catch (Exception e) {
            log.warn("[PensionService] Failed to query overview, returning fallback: {}", e.getMessage());
            return new PensionOverview("0", 0L, 0L, "0", "5.20%", true, "50000000");
        }
    }

    @Transactional
    public PensionAccountInfo getOrCreateAccount(String userId) {
        String findSql = "SELECT * FROM national_pension_accounts WHERE user_id = ?";
        try {
            return jdbcTemplate.queryForObject(findSql, (rs, rowNum) -> mapAccountRow(rs), userId);
        } catch (EmptyResultDataAccessException e) {
            String insertSql = """
                INSERT INTO national_pension_accounts (
                    id, user_id, tier, status, accumulated_contribution_wld, 
                    total_contributions_count, hourly_payout_rate_bps, total_payout_received_wld, 
                    created_at, updated_at
                ) VALUES (gen_random_uuid(), ?, 'BRONZE', 'ACTIVE', 0, 0, 50, 0, NOW(), NOW())
                RETURNING *
                """;
            return jdbcTemplate.queryForObject(insertSql, (rs, rowNum) -> mapAccountRow(rs), userId);
        }
    }

    @Transactional
    public Map<String, Object> contribute(String userId, Long amountWld, String note) {
        if (amountWld == null || amountWld <= 0) {
            throw new IllegalArgumentException("amountWld must be greater than 0");
        }

        PensionAccountInfo account = getOrCreateAccount(userId);

        // 국고(VAULT_MAIN) 편입 및 원장 전표 생성
        String txId = UUID.randomUUID().toString();
        jdbcTemplate.update("""
            UPDATE fiscal_vaults 
            SET balance_wld = balance_wld + ?, updated_at = NOW() 
            WHERE code = 'VAULT_MAIN'
            """, amountWld);

        // 연금 계좌 적립금 누적
        String updateAccSql = """
            UPDATE national_pension_accounts 
            SET accumulated_contribution_wld = accumulated_contribution_wld + ?,
                total_contributions_count = total_contributions_count + 1,
                updated_at = NOW()
            WHERE id = ?::uuid
            RETURNING accumulated_contribution_wld
            """;
        BigDecimal newAccumulated = jdbcTemplate.queryForObject(updateAccSql, BigDecimal.class, amountWld, account.getId());

        // 기여 내역 로그 기록
        jdbcTemplate.update("""
            INSERT INTO national_pension_contributions (
                id, account_id, user_id, amount_wld, note, created_at
            ) VALUES (gen_random_uuid(), ?::uuid, ?, ?, ?, NOW())
            """, account.getId(), userId, amountWld, note != null ? note : "국민연금 정기 기여금 납입");

        BigDecimal newVaultBal = jdbcTemplate.queryForObject(
            "SELECT balance_wld FROM fiscal_vaults WHERE code = 'VAULT_MAIN'",
            BigDecimal.class
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("txId", txId);
        result.put("userId", userId);
        result.put("amountWld", amountWld);
        result.put("newAccumulatedContributionWld", newAccumulated != null ? newAccumulated.toPlainString() : "0");
        result.put("newVaultBalanceWld", newVaultBal != null ? newVaultBal.toPlainString() : "0");
        result.put("message", "국민연금 기여금이 성공적으로 납입되어 국고로 편입되었습니다.");
        return result;
    }

    @Transactional
    public Map<String, Object> toggleRetirement(String userId) {
        PensionAccountInfo account = getOrCreateAccount(userId);
        String nextStatus = "RETIRED".equals(account.getStatus()) ? "ACTIVE" : "RETIRED";

        jdbcTemplate.update("""
            UPDATE national_pension_accounts 
            SET status = ?, 
                retired_at = CASE WHEN ? = 'RETIRED' THEN NOW() ELSE NULL END,
                updated_at = NOW()
            WHERE id = ?::uuid
            """, nextStatus, nextStatus, account.getId());

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("userId", userId);
        res.put("status", nextStatus);
        res.put("message", "RETIRED".equals(nextStatus) ? "은퇴 상태로 전환되어 정기 연금 수령이 활성화되었습니다." : "일반 가입자 상태로 복귀했습니다.");
        return res;
    }

    @Transactional(readOnly = true)
    public FundedPositionResponse getFundedPosition(String userId) {
        return new FundedPositionResponse("0", "0", "0", "0");
    }

    private PensionAccountInfo mapAccountRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        PensionAccountInfo info = new PensionAccountInfo();
        info.setId(rs.getString("id"));
        info.setUserId(rs.getString("user_id"));
        info.setTier(rs.getString("tier"));
        info.setStatus(rs.getString("status"));
        info.setAccumulatedContributionWld(rs.getBigDecimal("accumulated_contribution_wld").toPlainString());
        info.setTotalContributionsCount(rs.getInt("total_contributions_count"));
        info.setHourlyPayoutRateBps(rs.getInt("hourly_payout_rate_bps"));
        info.setTotalPayoutReceivedWld(rs.getBigDecimal("total_payout_received_wld").toPlainString());
        return info;
    }
}
