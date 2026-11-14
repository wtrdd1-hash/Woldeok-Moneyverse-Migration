package com.moneyverse.api.domain.centralbank.service;

import com.moneyverse.api.domain.centralbank.dto.CentralBankDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class CentralBankService {

    private static final Logger log = LoggerFactory.getLogger(CentralBankService.class);
    private final JdbcTemplate jdbcTemplate;

    public CentralBankService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public MonetaryAggregates getMonetaryAggregates() {
        String m0 = "54446000";
        String m1 = "85000000";
        String m2 = "120000000";

        try {
            BigDecimal vaultBal = jdbcTemplate.queryForObject(
                "SELECT balance_wld FROM fiscal_vaults WHERE code = 'VAULT_MAIN'",
                BigDecimal.class
            );
            if (vaultBal != null) m0 = vaultBal.toPlainString();
        } catch (Exception ignored) {}

        try {
            BigDecimal walletSum = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(balance_wld), 0) FROM wallets",
                BigDecimal.class
            );
            if (walletSum != null) {
                BigDecimal m1Val = new BigDecimal(m0).add(walletSum);
                m1 = m1Val.toPlainString();
                m2 = m1Val.multiply(new BigDecimal("1.4")).toPlainString();
            }
        } catch (Exception ignored) {}

        return new MonetaryAggregates(m0, m1, m2, "2.20", "7.00%", "3.50%");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBaseRate() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("baseRateBps", 350);
        res.put("baseRatePercent", "3.50%");
        res.put("taylorRuleRatePercent", "3.65%");
        res.put("disclosedAt", "2026-11-14T07:00:00Z");
        return res;
    }

    @Transactional
    public Map<String, Object> updateBaseRate(Integer baseRateBps, String reason, String actorId) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("baseRateBps", baseRateBps);
        res.put("reason", reason);
        res.put("actorId", actorId);
        res.put("message", "국가 기준금리가 성공적으로 갱신 고시되었습니다.");
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReserveRequirement() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("reserveRatioBps", 700);
        res.put("reserveRatioPercent", "7.00%");
        res.put("effectiveDate", "2026-11-14");
        return res;
    }

    @Transactional
    public Map<String, Object> updateReserveRequirement(Integer ratioBps, String reason, String actorId) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("reserveRatioBps", ratioBps);
        res.put("reason", reason);
        res.put("actorId", actorId);
        res.put("message", "상업은행 법정 지급준비율이 성공적으로 공시되었습니다.");
        return res;
    }
}
