package com.moneyverse.api.domain.space.service;

import com.moneyverse.api.domain.space.dto.SpaceDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SpaceService {

    private static final Logger log = LoggerFactory.getLogger(SpaceService.class);
    private final JdbcTemplate jdbcTemplate;

    public SpaceService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public MySpaceResponse getMySpaces(UUID userId) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        SpaceItem starter = new SpaceItem(
                UUID.fromString("b0000000-0000-0000-0000-000000000001"),
                userId,
                "SPACE_ROOM_STARTER",
                "기본 아파트",
                1,
                Map.of("grid", "12x12", "theme", "modern"),
                500L,
                now.plusDays(30),
                now
        );
        return new MySpaceResponse(true, List.of(starter), 1);
    }

    @Transactional
    public SpaceActionResponse purchaseSpace(UUID userId, PurchaseSpaceRequest req) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        UUID spaceId = UUID.randomUUID();
        SpaceItem created = new SpaceItem(
                spaceId,
                userId,
                req.spaceType() != null ? req.spaceType() : "SPACE_STUDIO",
                req.name() != null ? req.name() : "내 공간",
                1,
                Map.of("grid", "16x16", "theme", "luxury"),
                1200L,
                now.plusDays(30),
                now
        );
        return new SpaceActionResponse(true, "공간이 성공적으로 구매되었습니다.", created);
    }

    @Transactional
    public SpaceActionResponse updateLayout(UUID userId, UUID spaceId, Map<String, Object> layout) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        SpaceItem updated = new SpaceItem(
                spaceId,
                userId,
                "SPACE_STUDIO",
                "내 공간",
                1,
                layout != null ? layout : Map.of(),
                1200L,
                now.plusDays(30),
                now
        );
        return new SpaceActionResponse(true, "가구 배치가 저장되었습니다.", updated);
    }

    @Transactional
    public SpaceActionResponse payTax(UUID userId, UUID spaceId, int days) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        SpaceItem updated = new SpaceItem(
                spaceId,
                userId,
                "SPACE_STUDIO",
                "내 공간",
                1,
                Map.of(),
                1200L,
                now.plusDays(30 + days),
                now
        );
        return new SpaceActionResponse(true, days + "일분의 보유세가 완납되었습니다.", updated);
    }
}
