package com.moneyverse.api.domain.space.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class SpaceDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record SpaceItem(
            UUID id,
            UUID userId,
            String spaceType,
            String name,
            int level,
            Map<String, Object> layout,
            long propertyTaxDaily,
            OffsetDateTime taxPaidUntil,
            OffsetDateTime createdAt
    ) {}

    public record MySpaceResponse(
            boolean ok,
            List<SpaceItem> spaces,
            int totalCount
    ) {}

    public record SpaceActionResponse(
            boolean ok,
            String message,
            SpaceItem space
    ) {}

    public record PurchaseSpaceRequest(
            String spaceType,
            String name,
            String idempotencyKey
    ) {}

    public record UpdateLayoutRequest(
            Map<String, Object> layout
    ) {}

    public record PayTaxRequest(
            int days
    ) {}
}
