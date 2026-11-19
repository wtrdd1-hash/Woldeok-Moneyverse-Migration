package com.moneyverse.api.domain.space.service;

import com.moneyverse.api.domain.space.dto.SpaceDtos.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class SpaceService {

    private final JdbcTemplate jdbcTemplate;

    public SpaceService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public MySpaceResponse getMySpaces(UUID userId) {
        List<SpaceItem> spaces = List.of(
                new SpaceItem(
                        UUID.fromString("11111111-2222-3333-4444-555555555555"),
                        userId != null ? userId : UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20"),
                        "PENTHOUSE",
                        "강남 프라임 펜트하우스",
                        1,
                        Map.of("theme", "CYBERPUNK_LUXURY", "wallpaper", "MIDNIGHT_NEON", "furnitureCount", 8),
                        2500L,
                        OffsetDateTime.now().plusDays(30),
                        OffsetDateTime.now()
                )
        );
        return new MySpaceResponse(true, spaces, spaces.size());
    }

    @Transactional
    public SpaceActionResponse purchaseSpace(UUID userId, PurchaseSpaceRequest req) {
        return new SpaceActionResponse(true, "성공적으로 가상 부동산을 분양받았습니다.", null);
    }

    @Transactional
    public SpaceActionResponse updateLayout(UUID userId, UUID spaceId, Map<String, Object> layout) {
        return new SpaceActionResponse(true, "공간 인테리어 및 가구 배치가 갱신되었습니다.", null);
    }

    @Transactional
    public SpaceActionResponse payTax(UUID userId, UUID spaceId, int days) {
        return new SpaceActionResponse(true, "재산세가 정상적으로 납부되었습니다.", null);
    }
}
