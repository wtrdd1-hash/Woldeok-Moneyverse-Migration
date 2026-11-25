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
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "CENTRALBANK_CANONICAL_SOURCE_UNAVAILABLE");
    }

    @Transactional
    public Map<String, Object> updateBaseRate(Integer baseRateBps, String reason, String actorId) {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "CENTRALBANK_CANONICAL_SOURCE_UNAVAILABLE");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReserveRequirement() {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "CENTRALBANK_CANONICAL_SOURCE_UNAVAILABLE");
    }

    @Transactional
    public Map<String, Object> updateReserveRequirement(Integer ratioBps, String reason, String actorId) {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "CENTRALBANK_CANONICAL_SOURCE_UNAVAILABLE");
    }
}
