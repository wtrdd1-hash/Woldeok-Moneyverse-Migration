package com.moneyverse.api.domain.bond.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class BondDtos {

    public static class BondOverview {
        private String totalDebtWld;
        private String weightedAverageCouponBps;
        private Long activeIssuesCount;
        private Long totalHoldersCount;
        private String totalInterestPaidWld;

        public BondOverview() {}

        public BondOverview(String totalDebtWld, String weightedAverageCouponBps, Long activeIssuesCount,
                            Long totalHoldersCount, String totalInterestPaidWld) {
            this.totalDebtWld = totalDebtWld;
            this.weightedAverageCouponBps = weightedAverageCouponBps;
            this.activeIssuesCount = activeIssuesCount;
            this.totalHoldersCount = totalHoldersCount;
            this.totalInterestPaidWld = totalInterestPaidWld;
        }

        public String getTotalDebtWld() { return totalDebtWld; }
        public void setTotalDebtWld(String totalDebtWld) { this.totalDebtWld = totalDebtWld; }
        public String getWeightedAverageCouponBps() { return weightedAverageCouponBps; }
        public void setWeightedAverageCouponBps(String weightedAverageCouponBps) { this.weightedAverageCouponBps = weightedAverageCouponBps; }
        public Long getActiveIssuesCount() { return activeIssuesCount; }
        public void setActiveIssuesCount(Long activeIssuesCount) { this.activeIssuesCount = activeIssuesCount; }
        public Long getTotalHoldersCount() { return totalHoldersCount; }
        public void setTotalHoldersCount(Long totalHoldersCount) { this.totalHoldersCount = totalHoldersCount; }
        public String getTotalInterestPaidWld() { return totalInterestPaidWld; }
        public void setTotalInterestPaidWld(String totalInterestPaidWld) { this.totalInterestPaidWld = totalInterestPaidWld; }
    }

    public static class BondItem {
        private String id;
        private String symbol;
        private String name;
        private String parValueWld;
        private Integer annualCouponRateBps;
        private Integer maturityHours;
        private Long totalIssuedUnits;
        private Long availableUnits;
        private String status;
        private Instant createdAt;

        public BondItem() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getParValueWld() { return parValueWld; }
        public void setParValueWld(String parValueWld) { this.parValueWld = parValueWld; }
        public Integer getAnnualCouponRateBps() { return annualCouponRateBps; }
        public void setAnnualCouponRateBps(Integer annualCouponRateBps) { this.annualCouponRateBps = annualCouponRateBps; }
        public Integer getMaturityHours() { return maturityHours; }
        public void setMaturityHours(Integer maturityHours) { this.maturityHours = maturityHours; }
        public Long getTotalIssuedUnits() { return totalIssuedUnits; }
        public void setTotalIssuedUnits(Long totalIssuedUnits) { this.totalIssuedUnits = totalIssuedUnits; }
        public Long getAvailableUnits() { return availableUnits; }
        public void setAvailableUnits(Long availableUnits) { this.availableUnits = availableUnits; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class BondSubscribeRequest {
        @NotBlank(message = "bondId is required")
        private String bondId;

        @NotNull(message = "units is required")
        @Min(value = 1, message = "units must be at least 1")
        @JsonAlias({"units", "amount", "unit_count"})
        private Integer units;

        public BondSubscribeRequest() {}

        public String getBondId() { return bondId; }
        public void setBondId(String bondId) { this.bondId = bondId; }
        public Integer getUnits() { return units; }
        public void setUnits(Integer units) { this.units = units; }
    }

    public static class RepoBorrowRequest {
        @NotBlank(message = "holdingId is required")
        @JsonAlias({"holdingId", "holding_id"})
        private String holdingId;

        public RepoBorrowRequest() {}

        public String getHoldingId() { return holdingId; }
        public void setHoldingId(String holdingId) { this.holdingId = holdingId; }
    }

    public static class RepoRepayRequest {
        @NotBlank(message = "loanId is required")
        @JsonAlias({"loanId", "loan_id"})
        private String loanId;

        public RepoRepayRequest() {}

        public String getLoanId() { return loanId; }
        public void setLoanId(String loanId) { this.loanId = loanId; }
    }
}
