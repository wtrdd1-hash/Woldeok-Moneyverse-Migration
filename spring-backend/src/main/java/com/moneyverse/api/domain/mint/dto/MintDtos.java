package com.moneyverse.api.domain.mint.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class MintDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record MintBatchItem(
            UUID id,
            String batchNumber,
            long amountM0,
            String purpose,
            String recipient,
            String status,
            long seigniorageWld,
            OffsetDateTime createdAt
    ) {}

    public record CreateMintBatchRequest(
            long amountM0,
            String purpose,
            String recipient,
            String idempotencyKey
    ) {}

    public record BurnCurrencyRequest(
            long amountM0,
            String burnReason,
            String idempotencyKey
    ) {}

    public record SeigniorageLedgerResponse(
            boolean ok,
            long totalMintedM0,
            long totalBurnedM0,
            long netCirculatingM0,
            long cumulativeSeigniorageWld,
            OffsetDateTime lastUpdated
    ) {}

    public record MintBatchListResponse(
            boolean ok,
            List<MintBatchItem> batches,
            int totalCount
    ) {}

    public record MintActionResponse(
            boolean ok,
            String message,
            MintBatchItem batch
    ) {}
}
