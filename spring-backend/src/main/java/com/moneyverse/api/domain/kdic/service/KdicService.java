package com.moneyverse.api.domain.kdic.service;

import com.moneyverse.api.domain.kdic.dto.KdicDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class KdicService {

    private static final Logger log = LoggerFactory.getLogger(KdicService.class);

    private final JdbcTemplate jdbcTemplate;

    public KdicService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public KdicOverviewResponse getOverview() {
        log.info("[KdicService] Fetching KDIC fund overview and institution solvency metrics");

        KdicFundDto fund = fetchFund();
        List<InsuredInstitutionDto> institutions = fetchInstitutions();
        List<PremiumRecordDto> recentPremiums = fetchRecentPremiums();
        List<PayoutRecordDto> recentPayouts = fetchRecentPayouts();

        // A missing denominator or no reported BIS values is UNKNOWN, not a
        // fabricated healthy percentage.
        java.util.OptionalDouble bis = institutions.stream()
                .filter(i -> i.getReportedBisRatioPct() != null)
                .mapToDouble(InsuredInstitutionDto::getReportedBisRatioPct).average();
        Double avgBis = bis.isPresent() ? Math.round(bis.getAsDouble() * 100.0) / 100.0 : null;
        Double reserveCoverage = (fund.getTotalInsuredDepositsWld() != null
                && fund.getTotalInsuredDepositsWld() > 0 && fund.getTotalFundWld() != null)
                ? Math.round(((double) fund.getTotalFundWld() / fund.getTotalInsuredDepositsWld() * 100.0) * 100.0) / 100.0
                : null;
        KdicSummaryDto summary = new KdicSummaryDto(institutions.size(), avgBis, reserveCoverage);

        return new KdicOverviewResponse(fund, institutions, summary, recentPremiums, recentPayouts);
    }

    public KdicLedgerEvidenceDto getLedgerIntegrity() {
        // No journal-backed implementation exists for this operation yet.
        // Fail closed rather than returning fabricated financial evidence or success.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                "KDIC ledger-backed operation is not implemented");
    }

    @Transactional
    public Map<String, Object> assessPremiums(String actor) {
        // No journal-backed implementation exists for this operation yet.
        // Fail closed rather than returning fabricated financial evidence or success.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                "KDIC ledger-backed operation is not implemented");
    }

    @Transactional
    public Map<String, Object> injectEmergencyLiquidity(String institutionId, long amountWld, String actor) {
        // No journal-backed implementation exists for this operation yet.
        // Fail closed rather than returning fabricated financial evidence or success.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                "KDIC ledger-backed operation is not implemented");
    }

    @Transactional
    public Map<String, Object> executePayout(String institutionId, String reason, String actor) {
        // No journal-backed implementation exists for this operation yet.
        // Fail closed rather than returning fabricated financial evidence or success.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                "KDIC ledger-backed operation is not implemented");
    }

    private KdicFundDto fetchFund() {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT id, fund_name, total_fund_wld, protection_limit_per_user, total_insured_deposits_wld, cumulative_premiums_collected_wld, cumulative_payouts_wld, is_emergency_mode, updated_at FROM deposit_insurance_funds LIMIT 1",
                    (rs, rowNum) -> new KdicFundDto(
                            rs.getString("id"),
                            rs.getString("fund_name"),
                            rs.getLong("total_fund_wld"),
                            rs.getLong("protection_limit_per_user"),
                            rs.getLong("total_insured_deposits_wld"),
                            rs.getLong("cumulative_premiums_collected_wld"),
                            rs.getLong("cumulative_payouts_wld"),
                            rs.getBoolean("is_emergency_mode"),
                            rs.getTimestamp("updated_at") != null ? rs.getTimestamp("updated_at").toInstant().toString() : Instant.now().toString()
                    )
            );
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Verified KDIC fund source unavailable");
        }
    }
    private List<InsuredInstitutionDto> fetchInstitutions() {
        try {
            return jdbcTemplate.query(
                    "SELECT id, institution_name, institution_type, reported_bis_ratio_pct, total_deposits_wld, status, last_inspected_at FROM insured_institutions ORDER BY total_deposits_wld DESC",
                    (rs, rowNum) -> new InsuredInstitutionDto(
                            rs.getString("id"),
                            rs.getString("institution_name"),
                            rs.getString("institution_type"),
                            rs.getDouble("reported_bis_ratio_pct"),
                            rs.getLong("total_deposits_wld"),
                            rs.getString("status"),
                            rs.getTimestamp("last_inspected_at") != null ? rs.getTimestamp("last_inspected_at").toInstant().toString() : Instant.now().toString()
                    )
            );
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Verified KDIC institution source unavailable");
        }
    }
    private List<PremiumRecordDto> fetchRecentPremiums() {
        try {
            return jdbcTemplate.query(
                    "SELECT p.id, p.institution_id, i.institution_name, p.quarter_period, p.premium_amount_wld, p.status, p.assessed_at FROM deposit_insurance_premiums p LEFT JOIN insured_institutions i ON p.institution_id = i.id ORDER BY p.assessed_at DESC LIMIT 5",
                    (rs, rowNum) -> new PremiumRecordDto(
                            rs.getString("id"),
                            rs.getString("institution_id"),
                            rs.getString("institution_name") != null ? rs.getString("institution_name") : "시중금융기관",
                            rs.getString("quarter_period"),
                            rs.getLong("premium_amount_wld"),
                            rs.getString("status"),
                            rs.getTimestamp("assessed_at") != null ? rs.getTimestamp("assessed_at").toInstant().toString() : Instant.now().toString()
                    )
            );
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Verified KDIC premium receipt source unavailable");
        }
    }
    private List<PayoutRecordDto> fetchRecentPayouts() {
        try {
            return jdbcTemplate.query(
                    "SELECT py.id, py.institution_id, i.institution_name, py.user_id::text, u.display_name, py.original_deposit_wld, py.payout_amount_wld, py.created_at FROM deposit_insurance_payouts py LEFT JOIN insured_institutions i ON py.institution_id = i.id LEFT JOIN users u ON py.user_id = u.id ORDER BY py.created_at DESC LIMIT 5",
                    (rs, rowNum) -> new PayoutRecordDto(
                            rs.getString("id"),
                            rs.getString("institution_id"),
                            rs.getString("institution_name") != null ? rs.getString("institution_name") : "정리대상금융기관",
                            rs.getString("user_id"),
                            rs.getString("display_name"),
                            rs.getLong("original_deposit_wld"),
                            rs.getLong("payout_amount_wld"),
                            rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toInstant().toString() : Instant.now().toString()
                    )
            );
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Verified KDIC payout receipt source unavailable");
        }
    }
}
