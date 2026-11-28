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

    /**
     * Deposit insurance is deliberately closed (PRODUCT.md), its fund has not been reconciled with
     * canonical postings, and none of its tables is granted to the application role. This overview
     * also serves the unauthenticated portal routes, and its payout section carried member ids and
     * names, so it answers the closed state and reads nothing. Rejected alternative: actor-bound read
     * functions; there is no reconciled figure to show, and the public route must never carry rows.
     */
    public KdicOverviewResponse getOverview() {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Deposit insurance is closed; no reconciled KDIC figures are available");
    }

    public KdicLedgerEvidenceDto getLedgerIntegrity() {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "KDIC ledger evidence has not been reconciled with canonical postings");
    }

    @Transactional
    public Map<String, Object> assessPremiums(String actor) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "KDIC premium payment receipts are not verified");
    }

    @Transactional
    public Map<String, Object> injectEmergencyLiquidity(String institutionId, long amountWld, String actor) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "KDIC emergency funding requires canonical ledger posting");
    }

    @Transactional
    public Map<String, Object> executePayout(String institutionId, String reason, String actor) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "KDIC payouts require verified deposit-insurance receipts");
    }
}
