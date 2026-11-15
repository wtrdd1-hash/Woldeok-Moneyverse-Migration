package com.moneyverse.api.domain.stock.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public class StockDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StockMarketRow {
        @JsonProperty("id")
        private String id;

        @JsonProperty("symbol")
        private String symbol;

        @JsonProperty("name")
        private String name;

        @JsonProperty("description")
        private String description;

        @JsonProperty("current_price")
        @JsonAlias({"currentPrice", "current_price"})
        private String currentPrice;

        @JsonProperty("day_open_price")
        @JsonAlias({"dayOpenPrice", "day_open_price"})
        private String dayOpenPrice;

        @JsonProperty("day_high_price")
        @JsonAlias({"dayHighPrice", "day_high_price"})
        private String dayHighPrice;

        @JsonProperty("day_low_price")
        @JsonAlias({"dayLowPrice", "day_low_price"})
        private String dayLowPrice;

        @JsonProperty("shares_outstanding")
        @JsonAlias({"sharesOutstanding", "shares_outstanding"})
        private String sharesOutstanding;

        @JsonProperty("shares_available")
        @JsonAlias({"sharesAvailable", "shares_available"})
        private String sharesAvailable;

        @JsonProperty("halt_status")
        @JsonAlias({"haltStatus", "halt_status"})
        private String haltStatus;

        @JsonProperty("updated_at")
        @JsonAlias({"updatedAt", "updated_at"})
        private String updatedAt;

        public StockMarketRow() {}

        public StockMarketRow(String id, String symbol, String name, String description,
                              String currentPrice, String dayOpenPrice, String dayHighPrice, String dayLowPrice,
                              String sharesOutstanding, String sharesAvailable, String haltStatus, String updatedAt) {
            this.id = id;
            this.symbol = symbol;
            this.name = name;
            this.description = description;
            this.currentPrice = currentPrice;
            this.dayOpenPrice = dayOpenPrice;
            this.dayHighPrice = dayHighPrice;
            this.dayLowPrice = dayLowPrice;
            this.sharesOutstanding = sharesOutstanding;
            this.sharesAvailable = sharesAvailable;
            this.haltStatus = haltStatus;
            this.updatedAt = updatedAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCurrentPrice() { return currentPrice; }
        public void setCurrentPrice(String currentPrice) { this.currentPrice = currentPrice; }
        public String getDayOpenPrice() { return dayOpenPrice; }
        public void setDayOpenPrice(String dayOpenPrice) { this.dayOpenPrice = dayOpenPrice; }
        public String getDayHighPrice() { return dayHighPrice; }
        public void setDayHighPrice(String dayHighPrice) { this.dayHighPrice = dayHighPrice; }
        public String getDayLowPrice() { return dayLowPrice; }
        public void setDayLowPrice(String dayLowPrice) { this.dayLowPrice = dayLowPrice; }
        public String getSharesOutstanding() { return sharesOutstanding; }
        public void setSharesOutstanding(String sharesOutstanding) { this.sharesOutstanding = sharesOutstanding; }
        public String getSharesAvailable() { return sharesAvailable; }
        public void setSharesAvailable(String sharesAvailable) { this.sharesAvailable = sharesAvailable; }
        public String getHaltStatus() { return haltStatus; }
        public void setHaltStatus(String haltStatus) { this.haltStatus = haltStatus; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class StockMarketOverviewResponse {
        @JsonProperty("stocks")
        private List<StockMarketRow> stocks;

        public StockMarketOverviewResponse() {}
        public StockMarketOverviewResponse(List<StockMarketRow> stocks) { this.stocks = stocks; }
        public List<StockMarketRow> getStocks() { return stocks; }
        public void setStocks(List<StockMarketRow> stocks) { this.stocks = stocks; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StockWatchlistRow {
        @JsonProperty("stock_id")
        @JsonAlias({"stockId", "stock_id"})
        private String stockId;

        @JsonProperty("symbol")
        private String symbol;

        @JsonProperty("name")
        private String name;

        @JsonProperty("current_price")
        @JsonAlias({"currentPrice", "current_price"})
        private String currentPrice;

        @JsonProperty("day_open_price")
        @JsonAlias({"dayOpenPrice", "day_open_price"})
        private String dayOpenPrice;

        @JsonProperty("created_at")
        @JsonAlias({"createdAt", "created_at"})
        private String createdAt;

        public StockWatchlistRow() {}
        public StockWatchlistRow(String stockId, String symbol, String name, String currentPrice, String dayOpenPrice, String createdAt) {
            this.stockId = stockId;
            this.symbol = symbol;
            this.name = name;
            this.currentPrice = currentPrice;
            this.dayOpenPrice = dayOpenPrice;
            this.createdAt = createdAt;
        }

        public String getStockId() { return stockId; }
        public void setStockId(String stockId) { this.stockId = stockId; }
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCurrentPrice() { return currentPrice; }
        public void setCurrentPrice(String currentPrice) { this.currentPrice = currentPrice; }
        public String getDayOpenPrice() { return dayOpenPrice; }
        public void setDayOpenPrice(String dayOpenPrice) { this.dayOpenPrice = dayOpenPrice; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class WatchlistResponse {
        @JsonProperty("stocks")
        private List<StockWatchlistRow> stocks;

        public WatchlistResponse() {}
        public WatchlistResponse(List<StockWatchlistRow> stocks) { this.stocks = stocks; }
        public List<StockWatchlistRow> getStocks() { return stocks; }
        public void setStocks(List<StockWatchlistRow> stocks) { this.stocks = stocks; }
    }

    public static class WatchlistRequest {
        @JsonProperty("watching")
        private boolean watching;

        public WatchlistRequest() {}
        public WatchlistRequest(boolean watching) { this.watching = watching; }
        public boolean isWatching() { return watching; }
        public void setWatching(boolean watching) { this.watching = watching; }
    }

    public static class WatchlistToggleResponse {
        @JsonProperty("watching")
        private boolean watching;

        public WatchlistToggleResponse() {}
        public WatchlistToggleResponse(boolean watching) { this.watching = watching; }
        public boolean isWatching() { return watching; }
        public void setWatching(boolean watching) { this.watching = watching; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StockPortfolioRow {
        @JsonProperty("stock_id")
        @JsonAlias({"stockId", "stock_id"})
        private String stockId;

        @JsonProperty("symbol")
        private String symbol;

        @JsonProperty("name")
        private String name;

        @JsonProperty("quantity")
        private String quantity;

        @JsonProperty("average_cost")
        @JsonAlias({"averageCost", "average_cost"})
        private String averageCost;

        @JsonProperty("market_value")
        @JsonAlias({"marketValue", "market_value"})
        private String marketValue;

        @JsonProperty("current_price")
        @JsonAlias({"currentPrice", "current_price"})
        private String currentPrice;

        @JsonProperty("halt_status")
        @JsonAlias({"haltStatus", "halt_status"})
        private String haltStatus;

        public StockPortfolioRow() {}
        public StockPortfolioRow(String stockId, String symbol, String name, String quantity,
                                 String averageCost, String marketValue, String currentPrice, String haltStatus) {
            this.stockId = stockId;
            this.symbol = symbol;
            this.name = name;
            this.quantity = quantity;
            this.averageCost = averageCost;
            this.marketValue = marketValue;
            this.currentPrice = currentPrice;
            this.haltStatus = haltStatus;
        }

        public String getStockId() { return stockId; }
        public void setStockId(String stockId) { this.stockId = stockId; }
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getQuantity() { return quantity; }
        public void setQuantity(String quantity) { this.quantity = quantity; }
        public String getAverageCost() { return averageCost; }
        public void setAverageCost(String averageCost) { this.averageCost = averageCost; }
        public String getMarketValue() { return marketValue; }
        public void setMarketValue(String marketValue) { this.marketValue = marketValue; }
        public String getCurrentPrice() { return currentPrice; }
        public void setCurrentPrice(String currentPrice) { this.currentPrice = currentPrice; }
        public String getHaltStatus() { return haltStatus; }
        public void setHaltStatus(String haltStatus) { this.haltStatus = haltStatus; }
    }

    public static class PortfolioResponse {
        @JsonProperty("holdings")
        private List<StockPortfolioRow> holdings;

        public PortfolioResponse() {}
        public PortfolioResponse(List<StockPortfolioRow> holdings) { this.holdings = holdings; }
        public List<StockPortfolioRow> getHoldings() { return holdings; }
        public void setHoldings(List<StockPortfolioRow> holdings) { this.holdings = holdings; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StockHaltSettlementReceiptRow {
        @JsonProperty("id")
        private String id;

        @JsonProperty("halt_event_id")
        @JsonAlias({"haltEventId", "halt_event_id"})
        private String haltEventId;

        @JsonProperty("stock_id")
        @JsonAlias({"stockId", "stock_id"})
        private String stockId;

        @JsonProperty("stock_symbol")
        @JsonAlias({"stockSymbol", "stock_symbol"})
        private String stockSymbol;

        @JsonProperty("stock_name")
        @JsonAlias({"stockName", "stock_name"})
        private String stockName;

        @JsonProperty("quantity")
        private String quantity;

        @JsonProperty("basis_method")
        @JsonAlias({"basisMethod", "basis_method"})
        private String basisMethod;

        @JsonProperty("basis_unit_amount")
        @JsonAlias({"basisUnitAmount", "basis_unit_amount"})
        private String basisUnitAmount;

        @JsonProperty("refund_amount")
        @JsonAlias({"refundAmount", "refund_amount"})
        private String refundAmount;

        @JsonProperty("status")
        private String status;

        @JsonProperty("created_at")
        @JsonAlias({"createdAt", "created_at"})
        private String createdAt;

        public StockHaltSettlementReceiptRow() {}
        public StockHaltSettlementReceiptRow(String id, String haltEventId, String stockId, String stockSymbol,
                                            String stockName, String quantity, String basisMethod, String basisUnitAmount,
                                            String refundAmount, String status, String createdAt) {
            this.id = id;
            this.haltEventId = haltEventId;
            this.stockId = stockId;
            this.stockSymbol = stockSymbol;
            this.stockName = stockName;
            this.quantity = quantity;
            this.basisMethod = basisMethod;
            this.basisUnitAmount = basisUnitAmount;
            this.refundAmount = refundAmount;
            this.status = status;
            this.createdAt = createdAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getHaltEventId() { return haltEventId; }
        public void setHaltEventId(String haltEventId) { this.haltEventId = haltEventId; }
        public String getStockId() { return stockId; }
        public void setStockId(String stockId) { this.stockId = stockId; }
        public String getStockSymbol() { return stockSymbol; }
        public void setStockSymbol(String stockSymbol) { this.stockSymbol = stockSymbol; }
        public String getStockName() { return stockName; }
        public void setStockName(String stockName) { this.stockName = stockName; }
        public String getQuantity() { return quantity; }
        public void setQuantity(String quantity) { this.quantity = quantity; }
        public String getBasisMethod() { return basisMethod; }
        public void setBasisMethod(String basisMethod) { this.basisMethod = basisMethod; }
        public String getBasisUnitAmount() { return basisUnitAmount; }
        public void setBasisUnitAmount(String basisUnitAmount) { this.basisUnitAmount = basisUnitAmount; }
        public String getRefundAmount() { return refundAmount; }
        public void setRefundAmount(String refundAmount) { this.refundAmount = refundAmount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class HaltReceiptsResponse {
        @JsonProperty("receipts")
        private List<StockHaltSettlementReceiptRow> receipts;

        public HaltReceiptsResponse() {}
        public HaltReceiptsResponse(List<StockHaltSettlementReceiptRow> receipts) { this.receipts = receipts; }
        public List<StockHaltSettlementReceiptRow> getReceipts() { return receipts; }
        public void setReceipts(List<StockHaltSettlementReceiptRow> receipts) { this.receipts = receipts; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StockHistoryRow {
        @JsonProperty("trade_id")
        @JsonAlias({"tradeId", "trade_id"})
        private String tradeId;

        @JsonProperty("symbol")
        private String symbol;

        @JsonProperty("side")
        private String side;

        @JsonProperty("quantity")
        private String quantity;

        @JsonProperty("unit_price")
        @JsonAlias({"unitPrice", "unit_price"})
        private String unitPrice;

        @JsonProperty("gross_amount")
        @JsonAlias({"grossAmount", "gross_amount"})
        private String grossAmount;

        @JsonProperty("tax_amount")
        @JsonAlias({"taxAmount", "tax_amount"})
        private String taxAmount;

        @JsonProperty("created_at")
        @JsonAlias({"createdAt", "created_at"})
        private String createdAt;

        public StockHistoryRow() {}
        public StockHistoryRow(String tradeId, String symbol, String side, String quantity,
                               String unitPrice, String grossAmount, String taxAmount, String createdAt) {
            this.tradeId = tradeId;
            this.symbol = symbol;
            this.side = side;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.grossAmount = grossAmount;
            this.taxAmount = taxAmount;
            this.createdAt = createdAt;
        }

        public String getTradeId() { return tradeId; }
        public void setTradeId(String tradeId) { this.tradeId = tradeId; }
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        public String getSide() { return side; }
        public void setSide(String side) { this.side = side; }
        public String getQuantity() { return quantity; }
        public void setQuantity(String quantity) { this.quantity = quantity; }
        public String getUnitPrice() { return unitPrice; }
        public void setUnitPrice(String unitPrice) { this.unitPrice = unitPrice; }
        public String getGrossAmount() { return grossAmount; }
        public void setGrossAmount(String grossAmount) { this.grossAmount = grossAmount; }
        public String getTaxAmount() { return taxAmount; }
        public void setTaxAmount(String taxAmount) { this.taxAmount = taxAmount; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class TradeHistoryResponse {
        @JsonProperty("trades")
        private List<StockHistoryRow> trades;

        public TradeHistoryResponse() {}
        public TradeHistoryResponse(List<StockHistoryRow> trades) { this.trades = trades; }
        public List<StockHistoryRow> getTrades() { return trades; }
        public void setTrades(List<StockHistoryRow> trades) { this.trades = trades; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StockSparkSeriesRow {
        @JsonProperty("stock_id")
        @JsonAlias({"stockId", "stock_id"})
        private String stockId;

        @JsonProperty("prices")
        private List<String> prices;

        public StockSparkSeriesRow() {}
        public StockSparkSeriesRow(String stockId, List<String> prices) {
            this.stockId = stockId;
            this.prices = prices;
        }

        public String getStockId() { return stockId; }
        public void setStockId(String stockId) { this.stockId = stockId; }
        public List<String> getPrices() { return prices; }
        public void setPrices(List<String> prices) { this.prices = prices; }
    }

    public static class SparklinesResponse {
        @JsonProperty("series")
        private List<StockSparkSeriesRow> series;

        public SparklinesResponse() {}
        public SparklinesResponse(List<StockSparkSeriesRow> series) { this.series = series; }
        public List<StockSparkSeriesRow> getSeries() { return series; }
        public void setSeries(List<StockSparkSeriesRow> series) { this.series = series; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StockMarketEventRow {
        @JsonProperty("id")
        private String id;

        @JsonProperty("stock_id")
        @JsonAlias({"stockId", "stock_id"})
        private String stockId;

        @JsonProperty("symbol")
        private String symbol;

        @JsonProperty("name")
        private String name;

        @JsonProperty("direction")
        private String direction;

        @JsonProperty("strength")
        private int strength;

        @JsonProperty("headline")
        private String headline;

        @JsonProperty("body")
        private String body;

        @JsonProperty("source")
        private String source;

        @JsonProperty("starts_at")
        @JsonAlias({"startsAt", "starts_at"})
        private String startsAt;

        @JsonProperty("ends_at")
        @JsonAlias({"endsAt", "ends_at"})
        private String endsAt;

        public StockMarketEventRow() {}
        public StockMarketEventRow(String id, String stockId, String symbol, String name,
                                   String direction, int strength, String headline, String body,
                                   String source, String startsAt, String endsAt) {
            this.id = id;
            this.stockId = stockId;
            this.symbol = symbol;
            this.name = name;
            this.direction = direction;
            this.strength = strength;
            this.headline = headline;
            this.body = body;
            this.source = source;
            this.startsAt = startsAt;
            this.endsAt = endsAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getStockId() { return stockId; }
        public void setStockId(String stockId) { this.stockId = stockId; }
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDirection() { return direction; }
        public void setDirection(String direction) { this.direction = direction; }
        public int getStrength() { return strength; }
        public void setStrength(int strength) { this.strength = strength; }
        public String getHeadline() { return headline; }
        public void setHeadline(String headline) { this.headline = headline; }
        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }
        public String getStartsAt() { return startsAt; }
        public void setStartsAt(String startsAt) { this.startsAt = startsAt; }
        public String getEndsAt() { return endsAt; }
        public void setEndsAt(String endsAt) { this.endsAt = endsAt; }
    }

    public static class MarketEventsResponse {
        @JsonProperty("events")
        private List<StockMarketEventRow> events;

        public MarketEventsResponse() {}
        public MarketEventsResponse(List<StockMarketEventRow> events) { this.events = events; }
        public List<StockMarketEventRow> getEvents() { return events; }
        public void setEvents(List<StockMarketEventRow> events) { this.events = events; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StockPriceHistoryRow {
        @JsonProperty("recorded_at")
        @JsonAlias({"recordedAt", "recorded_at"})
        private String recordedAt;

        @JsonProperty("price")
        private String price;

        public StockPriceHistoryRow() {}
        public StockPriceHistoryRow(String recordedAt, String price) {
            this.recordedAt = recordedAt;
            this.price = price;
        }

        public String getRecordedAt() { return recordedAt; }
        public void setRecordedAt(String recordedAt) { this.recordedAt = recordedAt; }
        public String getPrice() { return price; }
        public void setPrice(String price) { this.price = price; }
    }

    public static class PriceHistoryResponse {
        @JsonProperty("prices")
        private List<StockPriceHistoryRow> prices;

        public PriceHistoryResponse() {}
        public PriceHistoryResponse(List<StockPriceHistoryRow> prices) { this.prices = prices; }
        public List<StockPriceHistoryRow> getPrices() { return prices; }
        public void setPrices(List<StockPriceHistoryRow> prices) { this.prices = prices; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StockCandleRow {
        @JsonProperty("bucket_at")
        @JsonAlias({"bucketAt", "bucket_at"})
        private String bucketAt;

        @JsonProperty("open_price")
        @JsonAlias({"openPrice", "open_price"})
        private String openPrice;

        @JsonProperty("high_price")
        @JsonAlias({"highPrice", "high_price"})
        private String highPrice;

        @JsonProperty("low_price")
        @JsonAlias({"lowPrice", "low_price"})
        private String lowPrice;

        @JsonProperty("close_price")
        @JsonAlias({"closePrice", "close_price"})
        private String closePrice;

        public StockCandleRow() {}
        public StockCandleRow(String bucketAt, String openPrice, String highPrice, String lowPrice, String closePrice) {
            this.bucketAt = bucketAt;
            this.openPrice = openPrice;
            this.highPrice = highPrice;
            this.lowPrice = lowPrice;
            this.closePrice = closePrice;
        }

        public String getBucketAt() { return bucketAt; }
        public void setBucketAt(String bucketAt) { this.bucketAt = bucketAt; }
        public String getOpenPrice() { return openPrice; }
        public void setOpenPrice(String openPrice) { this.openPrice = openPrice; }
        public String getHighPrice() { return highPrice; }
        public void setHighPrice(String highPrice) { this.highPrice = highPrice; }
        public String getLowPrice() { return lowPrice; }
        public void setLowPrice(String lowPrice) { this.lowPrice = lowPrice; }
        public String getClosePrice() { return closePrice; }
        public void setClosePrice(String closePrice) { this.closePrice = closePrice; }
    }

    @JsonInclude(JsonInclude.Include.ALWAYS)
    public static class StockRangeRow {
        @JsonProperty("day_high")
        @JsonAlias({"dayHigh", "day_high"})
        private String dayHigh;

        @JsonProperty("day_low")
        @JsonAlias({"dayLow", "day_low"})
        private String dayLow;

        @JsonProperty("year_high")
        @JsonAlias({"yearHigh", "year_high"})
        private String yearHigh;

        @JsonProperty("year_low")
        @JsonAlias({"yearLow", "year_low"})
        private String yearLow;

        @JsonProperty("first_trade_date")
        @JsonAlias({"firstTradeDate", "first_trade_date"})
        private String firstTradeDate;

        public StockRangeRow() {}
        public StockRangeRow(String dayHigh, String dayLow, String yearHigh, String yearLow, String firstTradeDate) {
            this.dayHigh = dayHigh;
            this.dayLow = dayLow;
            this.yearHigh = yearHigh;
            this.yearLow = yearLow;
            this.firstTradeDate = firstTradeDate;
        }

        public String getDayHigh() { return dayHigh; }
        public void setDayHigh(String dayHigh) { this.dayHigh = dayHigh; }
        public String getDayLow() { return dayLow; }
        public void setDayLow(String dayLow) { this.dayLow = dayLow; }
        public String getYearHigh() { return yearHigh; }
        public void setYearHigh(String yearHigh) { this.yearHigh = yearHigh; }
        public String getYearLow() { return yearLow; }
        public void setYearLow(String yearLow) { this.yearLow = yearLow; }
        public String getFirstTradeDate() { return firstTradeDate; }
        public void setFirstTradeDate(String firstTradeDate) { this.firstTradeDate = firstTradeDate; }
    }

    public static class CandlesResponse {
        @JsonProperty("interval")
        private int interval;

        @JsonProperty("candles")
        private List<StockCandleRow> candles;

        @JsonProperty("range")
        private StockRangeRow range;

        public CandlesResponse() {}
        public CandlesResponse(int interval, List<StockCandleRow> candles, StockRangeRow range) {
            this.interval = interval;
            this.candles = candles;
            this.range = range;
        }

        public int getInterval() { return interval; }
        public void setInterval(int interval) { this.interval = interval; }
        public List<StockCandleRow> getCandles() { return candles; }
        public void setCandles(List<StockCandleRow> candles) { this.candles = candles; }
        public StockRangeRow getRange() { return range; }
        public void setRange(StockRangeRow range) { this.range = range; }
    }

    public static class OrderRequest {
        @JsonProperty("side")
        @NotBlank
        @Pattern(regexp = "^(buy|sell)$", message = "side must be 'buy' or 'sell'")
        private String side;

        @JsonProperty("quantity")
        @NotNull
        @Min(value = 1, message = "quantity must be greater than 0")
        private Integer quantity;

        @JsonProperty("idempotencyKey")
        @JsonAlias({"idempotency_key", "idempotencyKey"})
        @NotBlank
        private String idempotencyKey;

        public OrderRequest() {}
        public OrderRequest(String side, Integer quantity, String idempotencyKey) {
            this.side = side;
            this.quantity = quantity;
            this.idempotencyKey = idempotencyKey;
        }

        public String getSide() { return side; }
        public void setSide(String side) { this.side = side; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getIdempotencyKey() { return idempotencyKey; }
        public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TradeResultResponse {
        @JsonProperty("trade_id")
        @JsonAlias({"tradeId", "trade_id"})
        private String tradeId;

        @JsonProperty("unit_price")
        @JsonAlias({"unitPrice", "unit_price"})
        private String unitPrice;

        @JsonProperty("gross_amount")
        @JsonAlias({"grossAmount", "gross_amount"})
        private String grossAmount;

        @JsonProperty("tax_amount")
        @JsonAlias({"taxAmount", "tax_amount"})
        private String taxAmount;

        @JsonProperty("current_price")
        @JsonAlias({"currentPrice", "current_price"})
        private String currentPrice;

        public TradeResultResponse() {}
        public TradeResultResponse(String tradeId, String unitPrice, String grossAmount, String taxAmount, String currentPrice) {
            this.tradeId = tradeId;
            this.unitPrice = unitPrice;
            this.grossAmount = grossAmount;
            this.taxAmount = taxAmount;
            this.currentPrice = currentPrice;
        }

        public String getTradeId() { return tradeId; }
        public void setTradeId(String tradeId) { this.tradeId = tradeId; }
        public String getUnitPrice() { return unitPrice; }
        public void setUnitPrice(String unitPrice) { this.unitPrice = unitPrice; }
        public String getGrossAmount() { return grossAmount; }
        public void setGrossAmount(String grossAmount) { this.grossAmount = grossAmount; }
        public String getTaxAmount() { return taxAmount; }
        public void setTaxAmount(String taxAmount) { this.taxAmount = taxAmount; }
        public String getCurrentPrice() { return currentPrice; }
        public void setCurrentPrice(String currentPrice) { this.currentPrice = currentPrice; }
    }
}
