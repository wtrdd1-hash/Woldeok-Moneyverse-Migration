package com.moneyverse.api.domain.club.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ClubDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ClubItem(
            UUID id,
            String tag,
            String name,
            String description,
            String charter,
            UUID ownerId,
            String joinMode,
            String status,
            int level,
            long experience,
            int memberCount,
            OffsetDateTime createdAt
    ) {}

    public record ClubListResponse(
            boolean ok,
            List<ClubItem> clubs,
            int totalCount
    ) {}

    public record ClubDetailResponse(
            boolean ok,
            ClubItem club,
            boolean isMember,
            String memberRole
    ) {}

    public record CreateClubRequest(
            String tag,
            String name,
            String description,
            String charter,
            String joinMode,
            String idempotencyKey
    ) {}

    public record ClubActionResponse(
            boolean ok,
            String message
    ) {}
}
