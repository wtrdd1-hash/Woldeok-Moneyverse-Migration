package com.moneyverse.api.domain.market.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class BlackMarketDtos {

    public static class BlackMarketAuctionItem {
        private String id;
        private String itemCode;
        private String itemTitle;
        private String itemDescription;
        private String itemIcon;
        private String itemBuffType;
        private Double itemBuffValue;
        private Long remainingSeconds;
        private Long startingBid;
        private Long currentBid;
        private String highestBidderId;
        private String highestBidderName;
        private Integer bidCount;
        private String status;

        public BlackMarketAuctionItem() {}

        public BlackMarketAuctionItem(String id, String itemCode, String itemTitle, String itemDescription,
                                      String itemIcon, String itemBuffType, Double itemBuffValue, Long remainingSeconds,
                                      Long startingBid, Long currentBid, String highestBidderId,
                                      String highestBidderName, Integer bidCount, String status) {
            this.id = id;
            this.itemCode = itemCode;
            this.itemTitle = itemTitle;
            this.itemDescription = itemDescription;
            this.itemIcon = itemIcon;
            this.itemBuffType = itemBuffType;
            this.itemBuffValue = itemBuffValue;
            this.remainingSeconds = remainingSeconds;
            this.startingBid = startingBid;
            this.currentBid = currentBid;
            this.highestBidderId = highestBidderId;
            this.highestBidderName = highestBidderName;
            this.bidCount = bidCount;
            this.status = status;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getItemCode() { return itemCode; }
        public void setItemCode(String itemCode) { this.itemCode = itemCode; }
        public String getItemTitle() { return itemTitle; }
        public void setItemTitle(String itemTitle) { this.itemTitle = itemTitle; }
        public String getItemDescription() { return itemDescription; }
        public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }
        public String getItemIcon() { return itemIcon; }
        public void setItemIcon(String itemIcon) { this.itemIcon = itemIcon; }
        public String getItemBuffType() { return itemBuffType; }
        public void setItemBuffType(String itemBuffType) { this.itemBuffType = itemBuffType; }
        public Double getItemBuffValue() { return itemBuffValue; }
        public void setItemBuffValue(Double itemBuffValue) { this.itemBuffValue = itemBuffValue; }
        public Long getRemainingSeconds() { return remainingSeconds; }
        public void setRemainingSeconds(Long remainingSeconds) { this.remainingSeconds = remainingSeconds; }
        public Long getStartingBid() { return startingBid; }
        public void setStartingBid(Long startingBid) { this.startingBid = startingBid; }
        public Long getCurrentBid() { return currentBid; }
        public void setCurrentBid(Long currentBid) { this.currentBid = currentBid; }
        public String getHighestBidderId() { return highestBidderId; }
        public void setHighestBidderId(String highestBidderId) { this.highestBidderId = highestBidderId; }
        public String getHighestBidderName() { return highestBidderName; }
        public void setHighestBidderName(String highestBidderName) { this.highestBidderName = highestBidderName; }
        public Integer getBidCount() { return bidCount; }
        public void setBidCount(Integer bidCount) { this.bidCount = bidCount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class BidLog {
        private String id;
        private String auctionId;
        private String bidderId;
        private String bidderName;
        private Long bidAmount;
        private String createdAt;

        public BidLog() {}
        public BidLog(String id, String auctionId, String bidderId, String bidderName, Long bidAmount, String createdAt) {
            this.id = id;
            this.auctionId = auctionId;
            this.bidderId = bidderId;
            this.bidderName = bidderName;
            this.bidAmount = bidAmount;
            this.createdAt = createdAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAuctionId() { return auctionId; }
        public void setAuctionId(String auctionId) { this.auctionId = auctionId; }
        public String getBidderId() { return bidderId; }
        public void setBidderId(String bidderId) { this.bidderId = bidderId; }
        public String getBidderName() { return bidderName; }
        public void setBidderName(String bidderName) { this.bidderName = bidderName; }
        public Long getBidAmount() { return bidAmount; }
        public void setBidAmount(Long bidAmount) { this.bidAmount = bidAmount; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class AuctionsResponse {
        private List<BlackMarketAuctionItem> auctions;
        public AuctionsResponse() {}
        public AuctionsResponse(List<BlackMarketAuctionItem> auctions) { this.auctions = auctions; }
        public List<BlackMarketAuctionItem> getAuctions() { return auctions; }
        public void setAuctions(List<BlackMarketAuctionItem> auctions) { this.auctions = auctions; }
    }

    public static class BidLogsResponse {
        private List<BidLog> logs;
        public BidLogsResponse() {}
        public BidLogsResponse(List<BidLog> logs) { this.logs = logs; }
        public List<BidLog> getLogs() { return logs; }
        public void setLogs(List<BidLog> logs) { this.logs = logs; }
    }

    public static class PlaceBidRequest {
        @NotNull(message = "bidAmount is required")
        @Min(value = 1, message = "bidAmount must be greater than 0")
        @JsonAlias({"bidAmount", "amount", "bid_amount"})
        private Long bidAmount;

        public PlaceBidRequest() {}
        public PlaceBidRequest(Long bidAmount) { this.bidAmount = bidAmount; }
        public Long getBidAmount() { return bidAmount; }
        public void setBidAmount(Long bidAmount) { this.bidAmount = bidAmount; }
    }
}
