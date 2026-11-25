package com.moneyverse.api.domain.casino.service;

import com.moneyverse.api.domain.casino.dto.CasinoDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.*;

@Service
public class CasinoService {

    private static final Logger log = LoggerFactory.getLogger(CasinoService.class);
    private final JdbcTemplate jdbcTemplate;
    private final SecureRandom random = new SecureRandom();

    public CasinoService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public CasinoStats getStats() {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "CASINO_CANONICAL_SOURCE_UNAVAILABLE");
    }

    @Transactional
    public Map<String, Object> play(String userId, CasinoPlayRequest req) {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "CASINO_CANONICAL_SOURCE_UNAVAILABLE");
    }
}
