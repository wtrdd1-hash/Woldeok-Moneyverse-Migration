package com.moneyverse.api.domain.board.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StockCommunityService {

    private final JdbcTemplate jdbcTemplate;

    @Autowired(required = false)
    public StockCommunityService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> createPost(String userId, Map<String, Object> body) {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "BOARD_CANONICAL_SOURCE_UNAVAILABLE");
    }

    public List<Map<String, Object>> publicList(String stockSymbol, String query) {
        // Source-truth gate (QA 2026-11-25): this method returned hard-coded
        // figures or claimed a write it never made. Unavailable until it is
        // backed by the database; never a fabricated answer.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "BOARD_CANONICAL_SOURCE_UNAVAILABLE");
    }
}
