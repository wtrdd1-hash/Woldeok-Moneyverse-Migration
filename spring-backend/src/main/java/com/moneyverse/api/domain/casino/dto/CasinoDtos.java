package com.moneyverse.api.domain.casino.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CasinoDtos {

    public static class CasinoStats {
        private String totalWageredWld;
        private String totalPayoutWld;
        private Long totalBetsCount;
        private String rtpPercent;
        private String jackpotPoolWld;

        public CasinoStats() {}

        public CasinoStats(String totalWageredWld, String totalPayoutWld, Long totalBetsCount,
                           String rtpPercent, String jackpotPoolWld) {
            this.totalWageredWld = totalWageredWld;
            this.totalPayoutWld = totalPayoutWld;
            this.totalBetsCount = totalBetsCount;
            this.rtpPercent = rtpPercent;
            this.jackpotPoolWld = jackpotPoolWld;
        }

        public String getTotalWageredWld() { return totalWageredWld; }
        public void setTotalWageredWld(String totalWageredWld) { this.totalWageredWld = totalWageredWld; }
        public String getTotalPayoutWld() { return totalPayoutWld; }
        public void setTotalPayoutWld(String totalPayoutWld) { this.totalPayoutWld = totalPayoutWld; }
        public Long getTotalBetsCount() { return totalBetsCount; }
        public void setTotalBetsCount(Long totalBetsCount) { this.totalBetsCount = totalBetsCount; }
        public String getRtpPercent() { return rtpPercent; }
        public void setRtpPercent(String rtpPercent) { this.rtpPercent = rtpPercent; }
        public String getJackpotPoolWld() { return jackpotPoolWld; }
        public void setJackpotPoolWld(String jackpotPoolWld) { this.jackpotPoolWld = jackpotPoolWld; }
    }

    public static class CasinoPlayRequest {
        @NotNull(message = "betAmountWld is required")
        @Min(value = 1, message = "betAmountWld must be at least 1")
        @JsonAlias({"betAmountWld", "bet_amount_wld", "amount", "betAmount"})
        private Long betAmountWld;

        private String gameType;
        private String prediction;

        public CasinoPlayRequest() {}

        public Long getBetAmountWld() { return betAmountWld; }
        public void setBetAmountWld(Long betAmountWld) { this.betAmountWld = betAmountWld; }
        public String getGameType() { return gameType; }
        public void setGameType(String gameType) { this.gameType = gameType; }
        public String getPrediction() { return prediction; }
        public void setPrediction(String prediction) { this.prediction = prediction; }
    }
}
