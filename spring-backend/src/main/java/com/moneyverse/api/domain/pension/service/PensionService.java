package com.moneyverse.api.domain.pension.service;

import com.moneyverse.api.domain.pension.dto.PensionDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
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

    /**
     * Aggregate overview from pension_public_overview (308). No figure is substituted: an unreadable
     * source is a 503, and no annual payout rate is claimed because no table holds one.
     */
    @Transactional(readOnly = true)
    public PensionOverview getOverview() {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT total_aum_wld, total_subscribers_count, total_retired_receivers_count, "
                            + "total_pension_paid_wld, vault_main_balance_wld FROM public.pension_public_overview()",
                    (rs, rowNum) -> new PensionOverview(
                            rs.getString("total_aum_wld"),
                            rs.getLong("total_subscribers_count"),
                            rs.getLong("total_retired_receivers_count"),
                            rs.getString("total_pension_paid_wld"),
                            null,
                            false,
                            rs.getString("vault_main_balance_wld")));
        } catch (DataAccessException unavailable) {
            log.warn("[PensionService] overview unavailable: {}", unavailable.getClass().getSimpleName());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "PENSION_SOURCE_UNAVAILABLE", unavailable);
        }
    }

    /**
     * Pure read for GET: never create a pension account, fabricate a zero balance,
     * or return records for a caller-supplied identity.
     * Actor must be derived from the authenticated session in the controller;
     * pension_owner_account (360) restricts the row to that actor.
     */
    @Transactional(readOnly = true)
    public Optional<PensionAccountInfo> readExistingAccount(String verifiedUserId) {
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(
                    "SELECT * FROM public.pension_owner_account(?::uuid)",
                    (rs, rowNum) -> mapAccountRow(rs),
                    verifiedUserId));
        } catch (EmptyResultDataAccessException noAccount) {
            return Optional.empty();
        } catch (DataAccessException unavailable) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "PENSION_SOURCE_UNAVAILABLE", unavailable);
        }
    }

    // Removed 2026-11-27: getOrCreateAccount/contribute/toggleRetirement/getFundedPosition had no
    // caller and wrote national_pension_accounts directly (balances outside the ledger). Contributions
    // go through pension_funded_contribute (ledgered) instead.

    private PensionAccountInfo mapAccountRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        PensionAccountInfo info = new PensionAccountInfo();
        info.setId(rs.getString("id"));
        info.setUserId(rs.getString("user_id"));
        info.setTier(rs.getString("tier"));
        info.setStatus(rs.getString("status"));
        info.setAccumulatedContributionWld(rs.getString("accumulated_contribution_wld"));
        info.setTotalContributionsCount(rs.getInt("total_contributions_count"));
        info.setHourlyPayoutRateBps(rs.getInt("hourly_payout_rate_bps"));
        info.setTotalPayoutReceivedWld(rs.getString("total_payout_received_wld"));
        return info;
    }
}
