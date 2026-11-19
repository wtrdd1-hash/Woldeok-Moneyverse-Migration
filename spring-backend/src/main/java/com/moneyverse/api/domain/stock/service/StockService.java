package com.moneyverse.api.domain.stock.service;

import com.moneyverse.api.domain.stock.dto.StockDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Array;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Service
public class StockService {

    private static final Logger log = LoggerFactory.getLogger(StockService.class);

    private static ResponseStatusException unavailable(String origin) {
        log.warn("Stock canonical source unavailable: {}", origin);
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "STOCK_SOURCE_UNAVAILABLE");
    }

    private final JdbcTemplate jdbcTemplate;

    public StockService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * 상장 주식 전체 시세 및 당일 등락 개요 조회
     */
    public List<StockMarketRow> list() {
        String sql = "SELECT id::text, symbol, name, description, " +
                "current_price::text AS current_price, day_open_price::text AS day_open_price, " +
                "day_high_price::text AS day_high_price, day_low_price::text AS day_low_price, " +
                "shares_outstanding::text AS shares_outstanding, shares_available::text AS shares_available, " +
                "coalesce(halt_status, 'ACTIVE') AS halt_status, updated_at " +
                "FROM public.stock_market_overview()";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("updated_at");
                String updatedAt = ts != null ? ts.toInstant().toString() : Instant.now().toString();

                return new StockMarketRow(
                        rs.getString("id"),
                        rs.getString("symbol"),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getString("current_price"),
                        rs.getString("day_open_price"),
                        rs.getString("day_high_price"),
                        rs.getString("day_low_price"),
                        rs.getString("shares_outstanding"),
                        rs.getString("shares_available"),
                        rs.getString("halt_status"),
                        updatedAt
                );
            });
        } catch (Exception e) {
            throw unavailable("market_overview");
        }
    }


    /**
     * 유저 관심 종목 목록 조회
     */
    public List<StockWatchlistRow> watchlist(UUID userId) {
        String sql = "SELECT stock_id::text, symbol, name, current_price::text, day_open_price::text, created_at " +
                "FROM public.stock_my_watchlist(?::uuid)";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("created_at");
                String createdAt = ts != null ? ts.toInstant().toString() : Instant.now().toString();

                return new StockWatchlistRow(
                        rs.getString("stock_id"),
                        rs.getString("symbol"),
                        rs.getString("name"),
                        rs.getString("current_price"),
                        rs.getString("day_open_price"),
                        createdAt
                );
            }, userId);
        } catch (Exception e) {

            throw unavailable("stock_my_watchlist{}");
        }
    }

    /**
     * 유저 관심 종목 추가/제거
     */
    public boolean setWatchlist(UUID userId, UUID stockId, boolean watching) {
        try {
            String sql = "SELECT public.stock_watchlist_set(?::uuid, ?::uuid, ?::boolean) AS watching";
            Boolean result = jdbcTemplate.queryForObject(sql, Boolean.class, userId, stockId, watching);
            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            throw unavailable("watchlist_write");
        }
    }

    /**
     * 유저 보유 주식 포트폴리오 조회
     */
    public List<StockPortfolioRow> portfolio(UUID userId) {
        String sql = "SELECT p.stock_id::text, p.symbol, p.name, p.quantity::text, " +
                "p.average_cost::text, p.market_value::text, p.current_price::text, " +
                "coalesce(v.halt_status, 'ACTIVE') AS halt_status " +
                "FROM public.stock_my_positions(?::uuid) p " +
                "LEFT JOIN public.stock_market_overview() v ON v.id = p.stock_id";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> new StockPortfolioRow(
                    rs.getString("stock_id"),
                    rs.getString("symbol"),
                    rs.getString("name"),
                    rs.getString("quantity"),
                    rs.getString("average_cost"),
                    rs.getString("market_value"),
                    rs.getString("current_price"),
                    rs.getString("halt_status")
            ), userId);
        } catch (Exception e) {

            throw unavailable("stock_my_positions{}");
        }
    }

    /**
     * 거래정지 정산 영수증 내역
     */
    public List<StockHaltSettlementReceiptRow> haltSettlementReceipts(UUID userId) {
        String sql = "SELECT id::text, halt_event_id::text, stock_id::text, stock_symbol, stock_name, " +
                "quantity::text, basis_method, basis_unit_amount::text, refund_amount::text, status, created_at " +
                "FROM public.stock_halt_settlement_receipts " +
                "WHERE user_id = ?::uuid ORDER BY created_at DESC LIMIT 50";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("created_at");
                String createdAt = ts != null ? ts.toInstant().toString() : Instant.now().toString();

                return new StockHaltSettlementReceiptRow(
                        rs.getString("id"),
                        rs.getString("halt_event_id"),
                        rs.getString("stock_id"),
                        rs.getString("stock_symbol"),
                        rs.getString("stock_name"),
                        rs.getString("quantity"),
                        rs.getString("basis_method"),
                        rs.getString("basis_unit_amount"),
                        rs.getString("refund_amount"),
                        rs.getString("status"),
                        createdAt
                );
            }, userId);
        } catch (Exception e) {

            throw unavailable("haltSettlementReceipts{}");
        }
    }

    /**
     * 유저 체결 내역 조회
     */
    public List<StockHistoryRow> history(UUID userId, int limit) {
        int boundedLimit = Math.min(200, Math.max(1, limit));
        String sql = "SELECT trade_id::text, symbol, side, quantity::text, " +
                "unit_price::text, gross_amount::text, tax_amount::text, created_at " +
                "FROM public.stock_my_trades(?::uuid, ?::int)";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("created_at");
                String createdAt = ts != null ? ts.toInstant().toString() : Instant.now().toString();

                return new StockHistoryRow(
                        rs.getString("trade_id"),
                        rs.getString("symbol"),
                        rs.getString("side"),
                        rs.getString("quantity"),
                        rs.getString("unit_price"),
                        rs.getString("gross_amount"),
                        rs.getString("tax_amount"),
                        createdAt
                );
            }, userId, boundedLimit);
        } catch (Exception e) {

            throw unavailable("stock_my_trades{}");
        }
    }

    /**
     * 전 종목 미니 스파크라인 가격 배열 조회
     */
    public List<StockSparkSeriesRow> sparkSeries(int limit) {
        int boundedLimit = Math.min(240, Math.max(1, limit));
        String sql = "SELECT stock_id::text, prices::text[] AS prices FROM public.stock_spark_series(?::int)";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                String stockId = rs.getString("stock_id");
                Array arr = rs.getArray("prices");
                List<String> prices = new ArrayList<>();
                if (arr != null) {
                    Object obj = arr.getArray();
                    if (obj instanceof String[] stringArr) {
                        prices.addAll(Arrays.asList(stringArr));
                    } else if (obj instanceof Object[] objArr) {
                        for (Object o : objArr) {
                            if (o != null) prices.add(o.toString());
                        }
                    }
                }
                return new StockSparkSeriesRow(stockId, prices);
            }, boundedLimit);
        } catch (Exception e) {

            throw unavailable("sparkSeries{}");
        }
    }

    /**
     * 활성화된 시장 이벤트 목록
     */
    public List<StockMarketEventRow> marketEvents() {
        String sql = "SELECT id::text, stock_id::text, symbol, name, direction, strength, " +
                "headline, body, source, starts_at, ends_at FROM public.stock_market_events_active()";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Timestamp startsTs = rs.getTimestamp("starts_at");
                Timestamp endsTs = rs.getTimestamp("ends_at");
                String startsAt = startsTs != null ? startsTs.toInstant().toString() : Instant.now().toString();
                String endsAt = endsTs != null ? endsTs.toInstant().toString() : Instant.now().toString();

                return new StockMarketEventRow(
                        rs.getString("id"),
                        rs.getString("stock_id"),
                        rs.getString("symbol"),
                        rs.getString("name"),
                        rs.getString("direction"),
                        rs.getInt("strength"),
                        rs.getString("headline"),
                        rs.getString("body"),
                        rs.getString("source"),
                        startsAt,
                        endsAt
                );
            });
        } catch (Exception e) {

            throw unavailable("marketEvents{}");
        }
    }

    /**
     * 단일 종목 가격 이력 조회
     */
    public List<StockPriceHistoryRow> priceHistory(UUID stockId, int limit) {
        int boundedLimit = Math.min(240, Math.max(1, limit));
        String sql = "SELECT recorded_at, price::text AS price FROM public.stock_price_history(?::uuid, ?::int)";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("recorded_at");
                String recordedAt = ts != null ? ts.toInstant().toString() : Instant.now().toString();
                return new StockPriceHistoryRow(recordedAt, rs.getString("price"));
            }, stockId, boundedLimit);
        } catch (Exception e) {

            throw unavailable("stock_price_history{}");
        }
    }

    /**
     * 캔들 차트 OHLC 데이터 조회
     */
    public List<StockCandleRow> candles(UUID stockId, int intervalSeconds, int limit) {
        int boundedLimit = Math.min(400, Math.max(1, limit));
        String sql = "SELECT bucket_at, open_price::text AS open_price, high_price::text AS high_price, " +
                "low_price::text AS low_price, close_price::text AS close_price " +
                "FROM public.stock_candles(?::uuid, ?::int, ?::int)";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("bucket_at");
                String bucketAt = ts != null ? ts.toInstant().toString() : Instant.now().toString();

                return new StockCandleRow(
                        bucketAt,
                        rs.getString("open_price"),
                        rs.getString("high_price"),
                        rs.getString("low_price"),
                        rs.getString("close_price")
                );
            }, stockId, intervalSeconds, boundedLimit);
        } catch (Exception e) {
            throw unavailable("candles");
        }
    }

    /**
     * 종목 최고/최저가 및 최초 거래일 조회
     */
    public StockRangeRow priceRange(UUID stockId) {
        String sql = "SELECT day_high::text AS day_high, day_low::text AS day_low, " +
                "year_high::text AS year_high, year_low::text AS year_low, " +
                "first_trade_date::text AS first_trade_date FROM public.stock_price_range(?::uuid)";

        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new StockRangeRow(
                    rs.getString("day_high"),
                    rs.getString("day_low"),
                    rs.getString("year_high"),
                    rs.getString("year_low"),
                    rs.getString("first_trade_date")
            ), stockId);
        } catch (Exception e) {
            throw unavailable("price_range");
        }
    }

    /**
     * 주식 매매 체결 (Idempotency 보장)
     */
    @Transactional
    public TradeResultResponse trade(UUID userId, UUID stockId, String side, int quantity, UUID idempotencyKey) {
        if (userId == null || stockId == null || idempotencyKey == null || side == null
                || !("buy".equalsIgnoreCase(side) || "sell".equalsIgnoreCase(side)) || quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_STOCK_ORDER");
        }
        String checkHaltSql = "SELECT coalesce(halt_status, 'ACTIVE') AS halt_status " +
                "FROM public.stock_market_overview() WHERE id = ?::uuid";
        String haltStatus;
        try {
            haltStatus = jdbcTemplate.queryForObject(checkHaltSql, String.class, stockId);
        } catch (Exception e) {
            throw unavailable("trade_halt_check");
        }
        if (haltStatus == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "STOCK_NOT_FOUND");
        }
        if (!"ACTIVE".equalsIgnoreCase(haltStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "STOCK_HALTED");
        }
        String tradeSql = "SELECT trade_id::text, unit_price::text, gross_amount::text, " +
                "tax_amount::text, current_price::text " +
                "FROM public.stock_trade(?::uuid, ?::uuid, ?::uuid, ?::text, ?::bigint)";
        try {
            TradeResultResponse receipt = jdbcTemplate.queryForObject(tradeSql, (rs, rowNum) ->
                    new TradeResultResponse(rs.getString("trade_id"), rs.getString("unit_price"),
                            rs.getString("gross_amount"), rs.getString("tax_amount"),
                            rs.getString("current_price")),
                    idempotencyKey, userId, stockId, side.toLowerCase(java.util.Locale.ROOT), quantity);
            if (receipt == null || receipt.getTradeId() == null || receipt.getUnitPrice() == null
                    || receipt.getGrossAmount() == null || receipt.getTaxAmount() == null) {
                throw unavailable("trade_receipt_missing");
            }
            return receipt;
        } catch (Exception e) {
            throw unavailable("trade_receipt");
        }
    }

    /**
     * 시장 틱 시뮬레이션 스텝 실행 (어드바이저리 락 획득 시 1스텝 전진)
     */
    public int liveTick() {
        try {
            String sql = "SELECT public.stock_market_live_tick()::text AS moved";
            String moved = jdbcTemplate.queryForObject(sql, String.class);
            return moved != null ? Integer.parseInt(moved) : 0;
        } catch (Exception e) {
            throw unavailable("market_tick");
        }
    }
}
