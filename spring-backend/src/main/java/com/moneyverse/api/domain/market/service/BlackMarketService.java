package com.moneyverse.api.domain.market.service;

import com.moneyverse.api.domain.market.dto.BlackMarketDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class BlackMarketService {

    private static final Logger log = LoggerFactory.getLogger(BlackMarketService.class);

    private final JdbcTemplate jdbcTemplate;

    public BlackMarketService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<BlackMarketAuctionItem> listAuctions() {
        log.info("[BlackMarketService] Listing active black market auctions");
        try {
            return jdbcTemplate.query(
                    "SELECT id, item_code, item_title, item_description, item_icon, item_buff_type, item_buff_value, " +
                            "EXTRACT(EPOCH FROM (ends_at - NOW()))::bigint AS remaining_seconds, starting_bid, current_bid, " +
                            "highest_bidder_id::text, highest_bidder_name, bid_count, status " +
                            "FROM black_market_auctions ORDER BY created_at DESC",
                    (rs, rowNum) -> new BlackMarketAuctionItem(
                            rs.getString("id"),
                            rs.getString("item_code"),
                            rs.getString("item_title"),
                            rs.getString("item_description"),
                            rs.getString("item_icon"),
                            rs.getString("item_buff_type"),
                            rs.getDouble("item_buff_value"),
                            Math.max(0L, rs.getLong("remaining_seconds")),
                            rs.getLong("starting_bid"),
                            rs.getLong("current_bid"),
                            // Sealed auction: the highest bidder is not disclosed (AR02 2026-11-28).
                            null,
                            null,
                            rs.getInt("bid_count"),
                            rs.getString("status")
                    )
            );
        } catch (Exception e) {
            // Never invent auction items or bids on a failed read (AR02 2026-11-28).
            log.warn("[BlackMarketService] Auction read failed: {}", e.getClass().getSimpleName());
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "SECRET_AUCTION_SOURCE_UNAVAILABLE");
        }
    }

    // The sealed-auction bid log is not read and bids are not written from the API: bidding answers
    // 503 until settlement is journaled, and the log's SELECT grant is revoked by migration 367.
}
