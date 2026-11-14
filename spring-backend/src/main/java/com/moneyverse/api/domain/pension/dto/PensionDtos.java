package com.moneyverse.api.domain.pension.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

public class PensionDtos {

    public static class PensionOverview {
        private String totalAumWld;
        private Long totalSubscribersCount;
        private Long totalRetiredReceiversCount;
        private String totalPensionPaidWld;
        private String benchmarkAnnualPayoutRate;
        private boolean annualPayoutRateCertified;
        private String vaultMainBalanceWld;

        public PensionOverview() {}

        public PensionOverview(String totalAumWld, Long totalSubscribersCount, Long totalRetiredReceiversCount,
                               String totalPensionPaidWld, String benchmarkAnnualPayoutRate,
                               boolean annualPayoutRateCertified, String vaultMainBalanceWld) {
            this.totalAumWld = totalAumWld;
            this.totalSubscribersCount = totalSubscribersCount;
            this.totalRetiredReceiversCount = totalRetiredReceiversCount;
            this.totalPensionPaidWld = totalPensionPaidWld;
            this.benchmarkAnnualPayoutRate = benchmarkAnnualPayoutRate;
            this.annualPayoutRateCertified = annualPayoutRateCertified;
            this.vaultMainBalanceWld = vaultMainBalanceWld;
        }

        public String getTotalAumWld() { return totalAumWld; }
        public void setTotalAumWld(String totalAumWld) { this.totalAumWld = totalAumWld; }
        public Long getTotalSubscribersCount() { return totalSubscribersCount; }
        public void setTotalSubscribersCount(Long totalSubscribersCount) { this.totalSubscribersCount = totalSubscribersCount; }
        public Long getTotalRetiredReceiversCount() { return totalRetiredReceiversCount; }
        public void setTotalRetiredReceiversCount(Long totalRetiredReceiversCount) { this.totalRetiredReceiversCount = totalRetiredReceiversCount; }
        public String getTotalPensionPaidWld() { return totalPensionPaidWld; }
        public void setTotalPensionPaidWld(String totalPensionPaidWld) { this.totalPensionPaidWld = totalPensionPaidWld; }
        public String getBenchmarkAnnualPayoutRate() { return benchmarkAnnualPayoutRate; }
        public void setBenchmarkAnnualPayoutRate(String benchmarkAnnualPayoutRate) { this.benchmarkAnnualPayoutRate = benchmarkAnnualPayoutRate; }
        public boolean isAnnualPayoutRateCertified() { return annualPayoutRateCertified; }
        public void setAnnualPayoutRateCertified(boolean annualPayoutRateCertified) { this.annualPayoutRateCertified = annualPayoutRateCertified; }
        public String getVaultMainBalanceWld() { return vaultMainBalanceWld; }
        public void setVaultMainBalanceWld(String vaultMainBalanceWld) { this.vaultMainBalanceWld = vaultMainBalanceWld; }
    }

    public static class PensionAccountInfo {
        private String id;
        private String userId;
        private String tier;
        private String status;
        private String accumulatedContributionWld;
        private Integer totalContributionsCount;
        private Integer hourlyPayoutRateBps;
        private String totalPayoutReceivedWld;
        private Instant lastPayoutAt;
        private Instant retiredAt;

        public PensionAccountInfo() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getTier() { return tier; }
        public void setTier(String tier) { this.tier = tier; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAccumulatedContributionWld() { return accumulatedContributionWld; }
        public void setAccumulatedContributionWld(String accumulatedContributionWld) { this.accumulatedContributionWld = accumulatedContributionWld; }
        public Integer getTotalContributionsCount() { return totalContributionsCount; }
        public void setTotalContributionsCount(Integer totalContributionsCount) { this.totalContributionsCount = totalContributionsCount; }
        public Integer getHourlyPayoutRateBps() { return hourlyPayoutRateBps; }
        public void setHourlyPayoutRateBps(Integer hourlyPayoutRateBps) { this.hourlyPayoutRateBps = hourlyPayoutRateBps; }
        public String getTotalPayoutReceivedWld() { return totalPayoutReceivedWld; }
        public void setTotalPayoutReceivedWld(String totalPayoutReceivedWld) { this.totalPayoutReceivedWld = totalPayoutReceivedWld; }
        public Instant getLastPayoutAt() { return lastPayoutAt; }
        public void setLastPayoutAt(Instant lastPayoutAt) { this.lastPayoutAt = lastPayoutAt; }
        public Instant getRetiredAt() { return retiredAt; }
        public void setRetiredAt(Instant retiredAt) { this.retiredAt = retiredAt; }
    }

    public static class PensionContributeRequest {
        @NotNull(message = "amountWld is required")
        @Min(value = 1, message = "amountWld must be at least 1")
        @JsonAlias({"amount", "amount_wld", "amountWld"})
        private Long amountWld;

        private String note;
        private String idempotencyKey;

        public PensionContributeRequest() {}

        public Long getAmountWld() { return amountWld; }
        public void setAmountWld(Long amountWld) { this.amountWld = amountWld; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public String getIdempotencyKey() { return idempotencyKey; }
        public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    }

    public static class FundedPositionResponse {
        private String fundedPrincipalWld;
        private String cumulativeFundedContributionWld;
        private String escrowBalanceWld;
        private String certifiedReceiptCount;

        public FundedPositionResponse() {}

        public FundedPositionResponse(String fundedPrincipalWld, String cumulativeFundedContributionWld,
                                      String escrowBalanceWld, String certifiedReceiptCount) {
            this.fundedPrincipalWld = fundedPrincipalWld;
            this.cumulativeFundedContributionWld = cumulativeFundedContributionWld;
            this.escrowBalanceWld = escrowBalanceWld;
            this.certifiedReceiptCount = certifiedReceiptCount;
        }

        public String getFundedPrincipalWld() { return fundedPrincipalWld; }
        public void setFundedPrincipalWld(String fundedPrincipalWld) { this.fundedPrincipalWld = fundedPrincipalWld; }
        public String getCumulativeFundedContributionWld() { return cumulativeFundedContributionWld; }
        public void setCumulativeFundedContributionWld(String cumulativeFundedContributionWld) { this.cumulativeFundedContributionWld = cumulativeFundedContributionWld; }
        public String getEscrowBalanceWld() { return escrowBalanceWld; }
        public void setEscrowBalanceWld(String escrowBalanceWld) { this.escrowBalanceWld = escrowBalanceWld; }
        public String getCertifiedReceiptCount() { return certifiedReceiptCount; }
        public void setCertifiedReceiptCount(String certifiedReceiptCount) { this.certifiedReceiptCount = certifiedReceiptCount; }
    }
}
