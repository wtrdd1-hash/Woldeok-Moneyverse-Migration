package com.moneyverse.api.domain.centralbank.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;

public class CentralBankDtos {

    public static class MonetaryAggregates {
        private String m0BaseMoneyWld;
        private String m1NarrowMoneyWld;
        private String m2BroadMoneyWld;
        private String moneyMultiplier;
        private String reserveRatioPercent;
        private String baseRatePercent;

        public MonetaryAggregates() {}

        public MonetaryAggregates(String m0BaseMoneyWld, String m1NarrowMoneyWld, String m2BroadMoneyWld,
                                  String moneyMultiplier, String reserveRatioPercent, String baseRatePercent) {
            this.m0BaseMoneyWld = m0BaseMoneyWld;
            this.m1NarrowMoneyWld = m1NarrowMoneyWld;
            this.m2BroadMoneyWld = m2BroadMoneyWld;
            this.moneyMultiplier = moneyMultiplier;
            this.reserveRatioPercent = reserveRatioPercent;
            this.baseRatePercent = baseRatePercent;
        }

        public String getM0BaseMoneyWld() { return m0BaseMoneyWld; }
        public void setM0BaseMoneyWld(String m0BaseMoneyWld) { this.m0BaseMoneyWld = m0BaseMoneyWld; }
        public String getM1NarrowMoneyWld() { return m1NarrowMoneyWld; }
        public void setM1NarrowMoneyWld(String m1NarrowMoneyWld) { this.m1NarrowMoneyWld = m1NarrowMoneyWld; }
        public String getM2BroadMoneyWld() { return m2BroadMoneyWld; }
        public void setM2BroadMoneyWld(String m2BroadMoneyWld) { this.m2BroadMoneyWld = m2BroadMoneyWld; }
        public String getMoneyMultiplier() { return moneyMultiplier; }
        public void setMoneyMultiplier(String moneyMultiplier) { this.moneyMultiplier = moneyMultiplier; }
        public String getReserveRatioPercent() { return reserveRatioPercent; }
        public void setReserveRatioPercent(String reserveRatioPercent) { this.reserveRatioPercent = reserveRatioPercent; }
        public String getBaseRatePercent() { return baseRatePercent; }
        public void setBaseRatePercent(String baseRatePercent) { this.baseRatePercent = baseRatePercent; }
    }

    public static class UpdateBaseRateRequest {
        @NotNull(message = "baseRateBps is required")
        @JsonAlias({"baseRateBps", "base_rate_bps", "rateBps"})
        private Integer baseRateBps;

        private String reason;

        public UpdateBaseRateRequest() {}

        public Integer getBaseRateBps() { return baseRateBps; }
        public void setBaseRateBps(Integer baseRateBps) { this.baseRateBps = baseRateBps; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class UpdateReserveRequirementRequest {
        @NotNull(message = "reserveRatioBps is required")
        @JsonAlias({"reserveRatioBps", "reserve_ratio_bps", "ratioBps"})
        private Integer reserveRatioBps;

        private String reason;

        public UpdateReserveRequirementRequest() {}

        public Integer getReserveRatioBps() { return reserveRatioBps; }
        public void setReserveRatioBps(Integer reserveRatioBps) { this.reserveRatioBps = reserveRatioBps; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
