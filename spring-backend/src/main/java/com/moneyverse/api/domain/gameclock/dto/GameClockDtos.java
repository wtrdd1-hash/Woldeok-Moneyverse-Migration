package com.moneyverse.api.domain.gameclock.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;

public class GameClockDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ServerGameClockResponse(
            boolean ok,
            String policyVersion,
            long dayIndex,
            long weekIndex,
            int dayOfWeek,
            int realSecondsPerDay,
            int gameDaysPerWeek,
            OffsetDateTime dayStartedAt,
            OffsetDateTime dayEndsAt,
            OffsetDateTime weekStartedAt,
            OffsetDateTime weekEndsAt
    ) {}
}
