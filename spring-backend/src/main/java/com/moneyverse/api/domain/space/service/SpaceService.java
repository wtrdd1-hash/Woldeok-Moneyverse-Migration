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
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "SPACE_CANONICAL_SOURCE_UNAVAILABLE");
    }

    @Transactional
    public SpaceActionResponse purchaseSpace(UUID userId, PurchaseSpaceRequest req) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "SPACE_CANONICAL_SOURCE_UNAVAILABLE");
    }

    @Transactional
    public SpaceActionResponse updateLayout(UUID userId, UUID spaceId, Map<String, Object> layout) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "SPACE_CANONICAL_SOURCE_UNAVAILABLE");
    }

    @Transactional
    public SpaceActionResponse payTax(UUID userId, UUID spaceId, int days) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "SPACE_CANONICAL_SOURCE_UNAVAILABLE");
    }
}
