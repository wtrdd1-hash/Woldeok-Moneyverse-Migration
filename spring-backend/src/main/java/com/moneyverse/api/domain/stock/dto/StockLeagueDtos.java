package com.moneyverse.api.domain.stock.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class StockLeagueDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StockLeagueSeasonDto {
        @JsonProperty("id")
        private String id;

        @JsonProperty("seasonNumber")
        @JsonAlias({"season_number", "seasonNumber"})
        private int seasonNumber;

        @JsonProperty("title")
        private String title;

        @JsonProperty("startsAt")
        @JsonAlias({"starts_at", "startsAt"})
        private String startsAt;

        @JsonProperty("endsAt")
        @JsonAlias({"ends_at", "endsAt"})
        private String endsAt;

        @JsonProperty("entryFee")
        @JsonAlias({"entry_fee", "entryFee"})
        private long entryFee;

        @JsonProperty("prizePool")
        @JsonAlias({"prize_pool", "prizePool"})
        private long prizePool;

        @JsonProperty("treasurySubsidy")
        @JsonAlias({"treasury_subsidy", "treasurySubsidy"})
        private long treasurySubsidy;

        @JsonProperty("status")
        private String status;

        @JsonProperty("winnerId")
        @JsonAlias({"winner_id", "winnerId"})
        private String winnerId;

        @JsonProperty("winnerName")
        @JsonAlias({"winner_name", "winnerName"})
        private String winnerName;

        @JsonProperty("totalParticipants")
        @JsonAlias({"total_participants", "totalParticipants"})
        private int totalParticipants;

        @JsonProperty("createdAt")
        @JsonAlias({"created_at", "createdAt"})
        private String createdAt;

        public StockLeagueSeasonDto() {}

        public StockLeagueSeasonDto(String id, int seasonNumber, String title, String startsAt, String endsAt,
                                    long entryFee, long prizePool, long treasurySubsidy, String status,
                                    String winnerId, String winnerName, int totalParticipants, String createdAt) {
            this.id = id;
            this.seasonNumber = seasonNumber;
            this.title = title;
            this.startsAt = startsAt;
            this.endsAt = endsAt;
            this.entryFee = entryFee;
            this.prizePool = prizePool;
            this.treasurySubsidy = treasurySubsidy;
            this.status = status;
            this.winnerId = winnerId;
            this.winnerName = winnerName;
            this.totalParticipants = totalParticipants;
            this.createdAt = createdAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public int getSeasonNumber() { return seasonNumber; }
        public void setSeasonNumber(int seasonNumber) { this.seasonNumber = seasonNumber; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getStartsAt() { return startsAt; }
        public void setStartsAt(String startsAt) { this.startsAt = startsAt; }
        public String getEndsAt() { return endsAt; }
        public void setEndsAt(String endsAt) { this.endsAt = endsAt; }
        public long getEntryFee() { return entryFee; }
        public void setEntryFee(long entryFee) { this.entryFee = entryFee; }
        public long getPrizePool() { return prizePool; }
        public void setPrizePool(long prizePool) { this.prizePool = prizePool; }
        public long getTreasurySubsidy() { return treasurySubsidy; }
        public void setTreasurySubsidy(long treasurySubsidy) { this.treasurySubsidy = treasurySubsidy; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getWinnerId() { return winnerId; }
        public void setWinnerId(String winnerId) { this.winnerId = winnerId; }
        public String getWinnerName() { return winnerName; }
        public void setWinnerName(String winnerName) { this.winnerName = winnerName; }
        public int getTotalParticipants() { return totalParticipants; }
        public void setTotalParticipants(int totalParticipants) { this.totalParticipants = totalParticipants; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StockLeagueParticipantDto {
        @JsonProperty("id")
        private String id;

        @JsonProperty("seasonId")
        @JsonAlias({"season_id", "seasonId"})
        private String seasonId;

        @JsonProperty("userId")
        @JsonAlias({"user_id", "userId"})
        private String userId;

        @JsonProperty("userName")
        @JsonAlias({"user_name", "userName"})
        private String userName;

        @JsonProperty("initialAsset")
        @JsonAlias({"initial_asset", "initialAsset"})
        private long initialAsset;

        @JsonProperty("currentAsset")
        @JsonAlias({"current_asset", "currentAsset"})
        private long currentAsset;

        @JsonProperty("roiRate")
        @JsonAlias({"roi_rate", "roiRate"})
        private double roiRate;

        @JsonProperty("rankPosition")
        @JsonAlias({"rank_position", "rankPosition"})
        private int rankPosition;

        @JsonProperty("tier")
        private String tier;

        @JsonProperty("isWhale")
        @JsonAlias({"is_whale", "isWhale"})
        private boolean isWhale;

        @JsonProperty("followerCount")
        @JsonAlias({"follower_count", "followerCount"})
        private int followerCount;

        @JsonProperty("createdAt")
        @JsonAlias({"created_at", "createdAt"})
        private String createdAt;

        public StockLeagueParticipantDto() {}

        public StockLeagueParticipantDto(String id, String seasonId, String userId, String userName,
                                         long initialAsset, long currentAsset, double roiRate,
                                         int rankPosition, String tier, boolean isWhale,
                                         int followerCount, String createdAt) {
            this.id = id;
            this.seasonId = seasonId;
            this.userId = userId;
            this.userName = userName;
            this.initialAsset = initialAsset;
            this.currentAsset = currentAsset;
            this.roiRate = roiRate;
            this.rankPosition = rankPosition;
            this.tier = tier;
            this.isWhale = isWhale;
            this.followerCount = followerCount;
            this.createdAt = createdAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getSeasonId() { return seasonId; }
        public void setSeasonId(String seasonId) { this.seasonId = seasonId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public long getInitialAsset() { return initialAsset; }
        public void setInitialAsset(long initialAsset) { this.initialAsset = initialAsset; }
        public long getCurrentAsset() { return currentAsset; }
        public void setCurrentAsset(long currentAsset) { this.currentAsset = currentAsset; }
        public double getRoiRate() { return roiRate; }
        public void setRoiRate(double roiRate) { this.roiRate = roiRate; }
        public int getRankPosition() { return rankPosition; }
        public void setRankPosition(int rankPosition) { this.rankPosition = rankPosition; }
        public String getTier() { return tier; }
        public void setTier(String tier) { this.tier = tier; }
        public boolean isWhale() { return isWhale; }
        public void setWhale(boolean whale) { isWhale = whale; }
        public int getFollowerCount() { return followerCount; }
        public void setFollowerCount(int followerCount) { this.followerCount = followerCount; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CopyTradingSubscriptionDto {
        @JsonProperty("id")
        private String id;

        @JsonProperty("followerId")
        @JsonAlias({"follower_id", "followerId"})
        private String followerId;

        @JsonProperty("followerName")
        @JsonAlias({"follower_name", "followerName"})
        private String followerName;

        @JsonProperty("whaleId")
        @JsonAlias({"whale_id", "whaleId"})
        private String whaleId;

        @JsonProperty("whaleName")
        @JsonAlias({"whale_name", "whaleName"})
        private String whaleName;

        @JsonProperty("allocatedBudget")
        @JsonAlias({"allocated_budget", "allocatedBudget"})
        private long allocatedBudget;

        @JsonProperty("usedBudget")
        @JsonAlias({"used_budget", "usedBudget"})
        private long usedBudget;

        @JsonProperty("copyRatio")
        @JsonAlias({"copy_ratio", "copyRatio"})
        private double copyRatio;

        @JsonProperty("totalProfitShared")
        @JsonAlias({"total_profit_shared", "totalProfitShared"})
        private long totalProfitShared;

        @JsonProperty("status")
        private String status;

        @JsonProperty("createdAt")
        @JsonAlias({"created_at", "createdAt"})
        private String createdAt;

        public CopyTradingSubscriptionDto() {}

        public CopyTradingSubscriptionDto(String id, String followerId, String followerName, String whaleId,
                                          String whaleName, long allocatedBudget, long usedBudget,
                                          double copyRatio, long totalProfitShared, String status, String createdAt) {
            this.id = id;
            this.followerId = followerId;
            this.followerName = followerName;
            this.whaleId = whaleId;
            this.whaleName = whaleName;
            this.allocatedBudget = allocatedBudget;
            this.usedBudget = usedBudget;
            this.copyRatio = copyRatio;
            this.totalProfitShared = totalProfitShared;
            this.status = status;
            this.createdAt = createdAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getFollowerId() { return followerId; }
        public void setFollowerId(String followerId) { this.followerId = followerId; }
        public String getFollowerName() { return followerName; }
        public void setFollowerName(String followerName) { this.followerName = followerName; }
        public String getWhaleId() { return whaleId; }
        public void setWhaleId(String whaleId) { this.whaleId = whaleId; }
        public String getWhaleName() { return whaleName; }
        public void setWhaleName(String whaleName) { this.whaleName = whaleName; }
        public long getAllocatedBudget() { return allocatedBudget; }
        public void setAllocatedBudget(long allocatedBudget) { this.allocatedBudget = allocatedBudget; }
        public long getUsedBudget() { return usedBudget; }
        public void setUsedBudget(long usedBudget) { this.usedBudget = usedBudget; }
        public double getCopyRatio() { return copyRatio; }
        public void setCopyRatio(double copyRatio) { this.copyRatio = copyRatio; }
        public long getTotalProfitShared() { return totalProfitShared; }
        public void setTotalProfitShared(long totalProfitShared) { this.totalProfitShared = totalProfitShared; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class SubscribeCopyTradingRequest {
        @JsonProperty("whaleId")
        @JsonAlias({"whale_id", "whaleId"})
        private String whaleId;

        @JsonProperty("whaleName")
        @JsonAlias({"whale_name", "whaleName"})
        private String whaleName;

        @JsonProperty("allocatedBudget")
        @JsonAlias({"allocated_budget", "allocatedBudget"})
        private long allocatedBudget;

        @JsonProperty("copyRatio")
        @JsonAlias({"copy_ratio", "copyRatio"})
        private Double copyRatio;

        public SubscribeCopyTradingRequest() {}

        public String getWhaleId() { return whaleId; }
        public void setWhaleId(String whaleId) { this.whaleId = whaleId; }
        public String getWhaleName() { return whaleName; }
        public void setWhaleName(String whaleName) { this.whaleName = whaleName; }
        public long getAllocatedBudget() { return allocatedBudget; }
        public void setAllocatedBudget(long allocatedBudget) { this.allocatedBudget = allocatedBudget; }
        public Double getCopyRatio() { return copyRatio; }
        public void setCopyRatio(Double copyRatio) { this.copyRatio = copyRatio; }
    }

    public static class CancelCopyTradingRequest {
        @JsonProperty("whaleId")
        @JsonAlias({"whale_id", "whaleId"})
        private String whaleId;

        public CancelCopyTradingRequest() {}
        public String getWhaleId() { return whaleId; }
        public void setWhaleId(String whaleId) { this.whaleId = whaleId; }
    }

    public static class CurrentLeagueResponse {
        @JsonProperty("success")
        private boolean success;

        @JsonProperty("season")
        private StockLeagueSeasonDto season;

        @JsonProperty("leaderboard")
        private List<StockLeagueParticipantDto> leaderboard;

        @JsonProperty("whales")
        private List<StockLeagueParticipantDto> whales;

        @JsonProperty("myParticipation")
        private StockLeagueParticipantDto myParticipation;

        @JsonProperty("mySubscriptions")
        private List<CopyTradingSubscriptionDto> mySubscriptions;

        public CurrentLeagueResponse() {}

        public CurrentLeagueResponse(boolean success, StockLeagueSeasonDto season,
                                     List<StockLeagueParticipantDto> leaderboard,
                                     List<StockLeagueParticipantDto> whales,
                                     StockLeagueParticipantDto myParticipation,
                                     List<CopyTradingSubscriptionDto> mySubscriptions) {
            this.success = success;
            this.season = season;
            this.leaderboard = leaderboard;
            this.whales = whales;
            this.myParticipation = myParticipation;
            this.mySubscriptions = mySubscriptions;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public StockLeagueSeasonDto getSeason() { return season; }
        public void setSeason(StockLeagueSeasonDto season) { this.season = season; }
        public List<StockLeagueParticipantDto> getLeaderboard() { return leaderboard; }
        public void setLeaderboard(List<StockLeagueParticipantDto> leaderboard) { this.leaderboard = leaderboard; }
        public List<StockLeagueParticipantDto> getWhales() { return whales; }
        public void setWhales(List<StockLeagueParticipantDto> whales) { this.whales = whales; }
        public StockLeagueParticipantDto getMyParticipation() { return myParticipation; }
        public void setMyParticipation(StockLeagueParticipantDto myParticipation) { this.myParticipation = myParticipation; }
        public List<CopyTradingSubscriptionDto> getMySubscriptions() { return mySubscriptions; }
        public void setMySubscriptions(List<CopyTradingSubscriptionDto> mySubscriptions) { this.mySubscriptions = mySubscriptions; }
    }

    public static class JoinLeagueResponse {
        @JsonProperty("success")
        private boolean success;

        @JsonProperty("participation")
        private StockLeagueParticipantDto participation;

        @JsonProperty("message")
        private String message;

        public JoinLeagueResponse() {}
        public JoinLeagueResponse(boolean success, StockLeagueParticipantDto participation, String message) {
            this.success = success;
            this.participation = participation;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public StockLeagueParticipantDto getParticipation() { return participation; }
        public void setParticipation(StockLeagueParticipantDto participation) { this.participation = participation; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
