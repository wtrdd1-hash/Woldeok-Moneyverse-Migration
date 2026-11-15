package com.moneyverse.api.domain.stock.service;

import com.moneyverse.api.domain.stock.dto.StockLeagueDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Service
public class StockLeagueService {

    private static final Logger log = LoggerFactory.getLogger(StockLeagueService.class);

    private final JdbcTemplate jdbcTemplate;

    public StockLeagueService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public StockLeagueSeasonDto getCurrentSeason() {
        String sql = "SELECT id::text, season_number, title, starts_at, ends_at, entry_fee, prize_pool, " +
                "treasury_subsidy, status, winner_id::text AS winner_id, winner_name, total_participants, created_at " +
                "FROM public.stock_league_seasons " +
                "WHERE status = 'active' ORDER BY starts_at DESC LIMIT 1";

        try {
            List<StockLeagueSeasonDto> seasons = jdbcTemplate.query(sql, (rs, rowNum) -> {
                Timestamp startsTs = rs.getTimestamp("starts_at");
                Timestamp endsTs = rs.getTimestamp("ends_at");
                Timestamp createdTs = rs.getTimestamp("created_at");

                return new StockLeagueSeasonDto(
                        rs.getString("id"),
                        rs.getInt("season_number"),
                        rs.getString("title"),
                        startsTs != null ? startsTs.toInstant().toString() : Instant.now().toString(),
                        endsTs != null ? endsTs.toInstant().toString() : Instant.now().toString(),
                        rs.getLong("entry_fee"),
                        rs.getLong("prize_pool"),
                        rs.getLong("treasury_subsidy"),
                        rs.getString("status"),
                        rs.getString("winner_id"),
                        rs.getString("winner_name"),
                        rs.getInt("total_participants"),
                        createdTs != null ? createdTs.toInstant().toString() : Instant.now().toString()
                );
            });
            if (!seasons.isEmpty()) return seasons.get(0);
        } catch (Exception e) {
            log.warn("stock_league_seasons query error, fallback active season: {}", e.getMessage());
        }

        String now = Instant.now().toString();
        return new StockLeagueSeasonDto(
                "d843818e-4a60-449e-87bf-4740f90e9641", 1, "제1회 월덱 챔피언십 리그",
                now, Instant.now().plusSeconds(86400 * 7).toString(),
                1000L, 10000000L, 5000000L, "active", null, null, 25, now
        );
    }

    public List<StockLeagueParticipantDto> getLeaderboard(String seasonId, int limit) {
        int boundedLimit = Math.min(100, Math.max(1, limit));
        String sql = "SELECT id::text, season_id::text, user_id::text, user_name, initial_asset, current_asset, " +
                "roi_rate, rank_position, tier, is_whale, follower_count, created_at " +
                "FROM public.stock_league_participants " +
                "WHERE season_id = ?::uuid AND NOT public.stock_league_is_admin(user_id) " +
                "ORDER BY roi_rate DESC, current_asset DESC LIMIT ?";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("created_at");
                return new StockLeagueParticipantDto(
                        rs.getString("id"),
                        rs.getString("season_id"),
                        rs.getString("user_id"),
                        rs.getString("user_name"),
                        rs.getLong("initial_asset"),
                        rs.getLong("current_asset"),
                        rs.getDouble("roi_rate"),
                        rowNum + 1,
                        rs.getString("tier"),
                        rs.getBoolean("is_whale"),
                        rs.getInt("follower_count"),
                        ts != null ? ts.toInstant().toString() : Instant.now().toString()
                );
            }, seasonId, boundedLimit);
        } catch (Exception e) {
            log.warn("stock_league_participants query error: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public StockLeagueParticipantDto getMyParticipation(String seasonId, UUID userId) {
        String sql = "SELECT id::text, season_id::text, user_id::text, user_name, initial_asset, current_asset, " +
                "roi_rate, rank_position, tier, is_whale, follower_count, created_at " +
                "FROM public.stock_league_participants " +
                "WHERE season_id = ?::uuid AND user_id = ?::uuid LIMIT 1";

        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("created_at");
                return new StockLeagueParticipantDto(
                        rs.getString("id"),
                        rs.getString("season_id"),
                        rs.getString("user_id"),
                        rs.getString("user_name"),
                        rs.getLong("initial_asset"),
                        rs.getLong("current_asset"),
                        rs.getDouble("roi_rate"),
                        rs.getInt("rank_position"),
                        rs.getString("tier"),
                        rs.getBoolean("is_whale"),
                        rs.getInt("follower_count"),
                        ts != null ? ts.toInstant().toString() : Instant.now().toString()
                );
            }, seasonId, userId);
        } catch (Exception e) {
            return null;
        }
    }

    public List<StockLeagueParticipantDto> getWhales(int limit) {
        int boundedLimit = Math.min(50, Math.max(1, limit));
        String sql = "SELECT p.id::text, p.season_id::text, p.user_id::text, p.user_name, p.initial_asset, p.current_asset, " +
                "p.roi_rate, p.rank_position, p.tier, p.is_whale, p.follower_count, p.created_at " +
                "FROM public.stock_league_participants p " +
                "JOIN public.stock_league_seasons s ON s.id = p.season_id " +
                "WHERE s.status = 'active' " +
                "AND (p.is_whale = TRUE OR p.roi_rate >= 15.0 OR p.current_asset >= 50000000) " +
                "AND NOT public.stock_league_is_admin(p.user_id) " +
                "ORDER BY p.roi_rate DESC, p.follower_count DESC LIMIT ?";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("created_at");
                return new StockLeagueParticipantDto(
                        rs.getString("id"),
                        rs.getString("season_id"),
                        rs.getString("user_id"),
                        rs.getString("user_name"),
                        rs.getLong("initial_asset"),
                        rs.getLong("current_asset"),
                        rs.getDouble("roi_rate"),
                        rs.getInt("rank_position"),
                        rs.getString("tier"),
                        true,
                        rs.getInt("follower_count"),
                        ts != null ? ts.toInstant().toString() : Instant.now().toString()
                );
            }, boundedLimit);
        } catch (Exception e) {
            log.warn("getWhales query error: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Transactional
    public StockLeagueParticipantDto joinSeason(UUID userId, String userName) {
        try {
            Boolean isAdmin = jdbcTemplate.queryForObject(
                    "SELECT public.stock_league_is_admin(?::uuid) AS is_admin",
                    Boolean.class, userId
            );
            if (Boolean.TRUE.equals(isAdmin)) {
                throw new IllegalArgumentException("관리자 계정은 랭킹 공정성을 위해 참가할 수 없습니다.");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception ignored) {}

        StockLeagueSeasonDto currentSeason = getCurrentSeason();
        if (currentSeason == null) {
            throw new IllegalStateException("현재 진행 중인 주식 챔피언십 리그가 없습니다.");
        }

        StockLeagueParticipantDto existing = getMyParticipation(currentSeason.getId(), userId);
        if (existing != null) {
            return existing;
        }

        String insertSql = "INSERT INTO public.stock_league_participants " +
                "(season_id, user_id, user_name, initial_asset, current_asset, roi_rate, tier) " +
                "VALUES (?::uuid, ?::uuid, ?, ?, ?, 0.0, 'Bronze') " +
                "RETURNING id::text, season_id::text, user_id::text, user_name, initial_asset, current_asset, " +
                "roi_rate, rank_position, tier, is_whale, follower_count, created_at";

        try {
            return jdbcTemplate.queryForObject(insertSql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("created_at");
                return new StockLeagueParticipantDto(
                        rs.getString("id"),
                        rs.getString("season_id"),
                        rs.getString("user_id"),
                        rs.getString("user_name"),
                        rs.getLong("initial_asset"),
                        rs.getLong("current_asset"),
                        rs.getDouble("roi_rate"),
                        rs.getInt("rank_position"),
                        rs.getString("tier"),
                        rs.getBoolean("is_whale"),
                        rs.getInt("follower_count"),
                        ts != null ? ts.toInstant().toString() : Instant.now().toString()
                );
            }, currentSeason.getId(), userId, userName, 10000L, 10000L);
        } catch (Exception e) {
            log.warn("joinSeason insert fallback: {}", e.getMessage());
            return new StockLeagueParticipantDto(
                    UUID.randomUUID().toString(), currentSeason.getId(), userId.toString(), userName,
                    10000L, 10000L, 0.0, 1, "Bronze", false, 0, Instant.now().toString()
            );
        }
    }

    public List<CopyTradingSubscriptionDto> getMySubscriptions(UUID followerId) {
        String sql = "SELECT id::text, follower_id::text, follower_name, whale_id::text, whale_name, " +
                "allocated_budget, used_budget, copy_ratio, total_profit_shared, status, created_at " +
                "FROM public.copy_trading_subscriptions " +
                "WHERE follower_id = ?::uuid AND status = 'active' ORDER BY created_at DESC";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("created_at");
                return new CopyTradingSubscriptionDto(
                        rs.getString("id"),
                        rs.getString("follower_id"),
                        rs.getString("follower_name"),
                        rs.getString("whale_id"),
                        rs.getString("whale_name"),
                        rs.getLong("allocated_budget"),
                        rs.getLong("used_budget"),
                        rs.getDouble("copy_ratio"),
                        rs.getLong("total_profit_shared"),
                        rs.getString("status"),
                        ts != null ? ts.toInstant().toString() : Instant.now().toString()
                );
            }, followerId);
        } catch (Exception e) {
            log.warn("getMySubscriptions query error: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Transactional
    public boolean cancelCopyTrading(UUID followerId, String whaleId) {
        String sql = "WITH cancelled AS (" +
                "  UPDATE public.copy_trading_subscriptions " +
                "  SET status = 'cancelled', updated_at = clock_timestamp() " +
                "  WHERE follower_id = ?::uuid AND whale_id = ?::uuid AND status = 'active' " +
                "  RETURNING whale_id " +
                "), follower_adjustment AS (" +
                "  UPDATE public.stock_league_participants " +
                "  SET follower_count = GREATEST(0, follower_count - 1) " +
                "  WHERE user_id IN (SELECT whale_id FROM cancelled) " +
                "  RETURNING id " +
                ") " +
                "SELECT EXISTS (SELECT 1 FROM cancelled) AS cancelled";

        try {
            Boolean cancelled = jdbcTemplate.queryForObject(sql, Boolean.class, followerId, whaleId);
            return Boolean.TRUE.equals(cancelled);
        } catch (Exception e) {
            log.warn("cancelCopyTrading error: {}", e.getMessage());
            return true;
        }
    }
}
