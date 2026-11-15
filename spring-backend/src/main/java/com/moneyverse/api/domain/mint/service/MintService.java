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
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        MintBatchItem item = new MintBatchItem(
                UUID.fromString("c0000000-0000-0000-0000-000000000001"),
                "MINT-202611-001",
                10_000_000_000L,
                "CENTRAL_BANK_RESERVE_INJECTION",
                "한국중앙은행",
                "SETTLED",
                250_000_000L,
                now.minusDays(2)
        );
        return new MintBatchListResponse(true, List.of(item), 1);
    }

    public MintBatchItem getBatchById(UUID id) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return new MintBatchItem(
                id,
                "MINT-202611-001",
                10_000_000_000L,
                "CENTRAL_BANK_RESERVE_INJECTION",
                "한국중앙은행",
                "SETTLED",
                250_000_000L,
                now.minusDays(2)
        );
    }

    public SeigniorageLedgerResponse getSeigniorageLedger() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return new SeigniorageLedgerResponse(
                true,
                500_000_000_000L,
                24_000_000_000L,
                476_000_000_000L,
                12_500_000_000L,
                now
        );
    }

    @Transactional
    public MintActionResponse createMintBatch(UUID actorId, CreateMintBatchRequest req) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        UUID batchId = UUID.randomUUID();
        MintBatchItem batch = new MintBatchItem(
                batchId,
                "MINT-" + System.currentTimeMillis(),
                req.amountM0(),
                req.purpose() != null ? req.purpose() : "GENERAL_EXPANSION",
                req.recipient() != null ? req.recipient() : "CENTRAL_BANK",
                "SETTLED",
                req.amountM0() / 40,
                now
        );
        return new MintActionResponse(true, "본원통화 주조 배치가 승인되었습니다.", batch);
    }

    @Transactional
    public MintActionResponse burnCurrency(UUID actorId, BurnCurrencyRequest req) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        UUID batchId = UUID.randomUUID();
        MintBatchItem batch = new MintBatchItem(
                batchId,
                "BURN-" + System.currentTimeMillis(),
                req.amountM0(),
                req.burnReason() != null ? req.burnReason() : "INFLATION_STABILIZATION",
                "TREASURY_SINK",
                "BURNED",
                0L,
                now
        );
        return new MintActionResponse(true, "통화 영구 소각이 완료되었습니다.", batch);
    }
}
