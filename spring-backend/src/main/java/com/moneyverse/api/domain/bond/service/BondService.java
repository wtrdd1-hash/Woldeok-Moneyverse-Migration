package com.moneyverse.api.domain.bond.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigInteger;
import java.time.Instant;
import java.util.*;

/**
 * Virtual bond reads through the 312 functions: the catalogue and aggregate totals for everyone,
 * holdings for the verified owner only. Nothing is substituted when a source is unreadable (503).
 * Subscriptions, repo loans and repayments used to write the bond tables directly; they had no
 * caller (the controller refuses them until journaled functions exist) and were removed.
 */
@Service
public class BondService {

    private static final Logger log = LoggerFactory.getLogger(BondService.class);
    private static final Set<String> LIVE = Set.of("OPEN_SUBSCRIPTION", "TRADING");
    private final JdbcTemplate jdbcTemplate;

    public BondService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** {overview, bonds, disclosed_at} in the shape the public bond page verifies. */
    @Transactional(readOnly = true)
    public Map<String, Object> marketSnapshot() {
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT id::text AS id, symbol, name, maturity_hours, annual_coupon_rate_bps, hourly_coupon_rate_bps, "
                            + "par_value_wld::text AS par_value_wld, total_issued_units::text AS total_issued_units, "
                            + "available_units::text AS available_units, total_funded_wld::text AS total_funded_wld, "
                            + "status, description FROM public.bond_public_catalog() ORDER BY created_at DESC, id LIMIT 100");
            Map<String, Object> totals = jdbcTemplate.queryForMap(
                    "SELECT holders_count, coupons_paid_wld FROM public.bond_public_read_totals()");
            BigInteger funded = BigInteger.ZERO;
            int active = 0;
            for (Map<String, Object> row : rows) {
                funded = funded.add(new BigInteger(String.valueOf(row.get("total_funded_wld"))));
                if (LIVE.contains(String.valueOf(row.get("status")))) active++;
            }
            Map<String, Object> overview = new LinkedHashMap<>();
            overview.put("totalBondsActive", active);
            overview.put("totalFundedWld", funded.toString());
            overview.put("totalHoldersCount", Integer.parseInt(String.valueOf(totals.get("holders_count"))));
            overview.put("totalCouponsPaidWld", String.valueOf(totals.get("coupons_paid_wld")));
            Map<String, Object> snapshot = new LinkedHashMap<>();
            snapshot.put("overview", overview);
            snapshot.put("bonds", rows);
            snapshot.put("disclosed_at", Instant.now().toString());
            return snapshot;
        } catch (DataAccessException e) {
            log.warn("[BondService] market unavailable: {}", e.getClass().getSimpleName());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BOND_MARKET_UNAVAILABLE");
        }
    }

    /** The verified owner's holdings (bond_owner_holdings restricts the rows to that actor). */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listUserHoldings(String userId) {
        try {
            return jdbcTemplate.queryForList("SELECT * FROM public.bond_owner_holdings(?::uuid)", userId);
        } catch (DataAccessException e) {
            log.warn("[BondService] holdings unavailable: {}", e.getClass().getSimpleName());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BOND_HOLDINGS_UNAVAILABLE");
        }
    }
}
