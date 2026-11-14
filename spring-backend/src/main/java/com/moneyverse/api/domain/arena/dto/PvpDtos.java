package com.moneyverse.api.domain.arena.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class PvpDtos {

    public static class PvpRoomDto {
        private String id;
        private String creatorUserId;
        private String creatorName;
        private String opponentUserId;
        private String opponentName;
        private String gameType;
        private Long stakeAmount;
        private Double feeRate;
        private Long treasuryFee;
        private String winnerId;
        private String status;
        private String creatorMove;
        private String opponentMove;
        private Map<String, Object> battleResult;
        private String createdAt;
        private String settledAt;

        public PvpRoomDto() {}

        public PvpRoomDto(String id, String creatorUserId, String creatorName, String opponentUserId,
                          String opponentName, String gameType, Long stakeAmount, Double feeRate,
                          Long treasuryFee, String winnerId, String status, String creatorMove,
                          String opponentMove, Map<String, Object> battleResult, String createdAt, String settledAt) {
            this.id = id;
            this.creatorUserId = creatorUserId;
            this.creatorName = creatorName;
            this.opponentUserId = opponentUserId;
            this.opponentName = opponentName;
            this.gameType = gameType;
            this.stakeAmount = stakeAmount;
            this.feeRate = feeRate;
            this.treasuryFee = treasuryFee;
            this.winnerId = winnerId;
            this.status = status;
            this.creatorMove = creatorMove;
            this.opponentMove = opponentMove;
            this.battleResult = battleResult;
            this.createdAt = createdAt;
            this.settledAt = settledAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getCreatorUserId() { return creatorUserId; }
        public void setCreatorUserId(String creatorUserId) { this.creatorUserId = creatorUserId; }
        public String getCreatorName() { return creatorName; }
        public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
        public String getOpponentUserId() { return opponentUserId; }
        public void setOpponentUserId(String opponentUserId) { this.opponentUserId = opponentUserId; }
        public String getOpponentName() { return opponentName; }
        public void setOpponentName(String opponentName) { this.opponentName = opponentName; }
        public String getGameType() { return gameType; }
        public void setGameType(String gameType) { this.gameType = gameType; }
        public Long getStakeAmount() { return stakeAmount; }
        public void setStakeAmount(Long stakeAmount) { this.stakeAmount = stakeAmount; }
        public Double getFeeRate() { return feeRate; }
        public void setFeeRate(Double feeRate) { this.feeRate = feeRate; }
        public Long getTreasuryFee() { return treasuryFee; }
        public void setTreasuryFee(Long treasuryFee) { this.treasuryFee = treasuryFee; }
        public String getWinnerId() { return winnerId; }
        public void setWinnerId(String winnerId) { this.winnerId = winnerId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCreatorMove() { return creatorMove; }
        public void setCreatorMove(String creatorMove) { this.creatorMove = creatorMove; }
        public String getOpponentMove() { return opponentMove; }
        public void setOpponentMove(String opponentMove) { this.opponentMove = opponentMove; }
        public Map<String, Object> getBattleResult() { return battleResult; }
        public void setBattleResult(Map<String, Object> battleResult) { this.battleResult = battleResult; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public String getSettledAt() { return settledAt; }
        public void setSettledAt(String settledAt) { this.settledAt = settledAt; }
    }

    public static class CreateRoomRequest {
        @NotBlank(message = "gameType is required")
        private String gameType;

        @NotNull(message = "stakeAmount is required")
        @Min(value = 100, message = "stakeAmount must be at least 100")
        @JsonAlias({"stakeAmount", "stake", "amount"})
        private Long stakeAmount;

        private String move;

        public CreateRoomRequest() {}
        public CreateRoomRequest(String gameType, Long stakeAmount, String move) {
            this.gameType = gameType;
            this.stakeAmount = stakeAmount;
            this.move = move;
        }

        public String getGameType() { return gameType; }
        public void setGameType(String gameType) { this.gameType = gameType; }
        public Long getStakeAmount() { return stakeAmount; }
        public void setStakeAmount(Long stakeAmount) { this.stakeAmount = stakeAmount; }
        public String getMove() { return move; }
        public void setMove(String move) { this.move = move; }
    }

    public static class JoinRoomRequest {
        private String move;
        public JoinRoomRequest() {}
        public JoinRoomRequest(String move) { this.move = move; }
        public String getMove() { return move; }
        public void setMove(String move) { this.move = move; }
    }
}
