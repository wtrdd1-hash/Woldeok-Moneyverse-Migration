package com.moneyverse.api.domain.space.service;

import com.moneyverse.api.domain.space.dto.SpaceDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
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
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Actual owned spaces source unavailable");
    }

    @Transactional
    public SpaceActionResponse purchaseSpace(UUID userId, PurchaseSpaceRequest req) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Space purchase ledger receipt unavailable");
    }

    @Transactional
    public SpaceActionResponse updateLayout(UUID userId, UUID spaceId, Map<String, Object> layout) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Space layout ownership receipt unavailable");
    }

    @Transactional
    public SpaceActionResponse payTax(UUID userId, UUID spaceId, int days) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Property tax settlement receipt unavailable");
    }
}
