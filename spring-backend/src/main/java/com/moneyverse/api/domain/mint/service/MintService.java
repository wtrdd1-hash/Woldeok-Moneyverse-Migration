package com.moneyverse.api.domain.mint.service;

import com.moneyverse.api.domain.mint.dto.MintDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class MintService {

    private static final Logger log = LoggerFactory.getLogger(MintService.class);
    private final JdbcTemplate jdbcTemplate;

    public MintService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public MintBatchListResponse getBatches() {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "MINT_CANONICAL_SOURCE_UNAVAILABLE");
    }

    public MintBatchItem getBatchById(UUID id) {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "MINT_CANONICAL_SOURCE_UNAVAILABLE");
    }

    public SeigniorageLedgerResponse getSeigniorageLedger() {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "MINT_CANONICAL_SOURCE_UNAVAILABLE");
    }

    @Transactional
    public MintActionResponse createMintBatch(UUID actorId, CreateMintBatchRequest req) {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "MINT_CANONICAL_SOURCE_UNAVAILABLE");
    }

    @Transactional
    public MintActionResponse burnCurrency(UUID actorId, BurnCurrencyRequest req) {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "MINT_CANONICAL_SOURCE_UNAVAILABLE");
    }
}
