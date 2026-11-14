package com.moneyverse.api.domain.kdic.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

public class KdicDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class KdicFundDto {
        private String id;
        private String fundName;
        private Long totalFundWld;
        private Long protectionLimitPerUser;
        private Long totalInsuredDepositsWld;
        private Long cumulativePremiumsCollectedWld;
        private Long cumulativePayoutsWld;
        private Boolean isEmergencyMode;
        private String updatedAt;

        public KdicFundDto() {}

        public KdicFundDto(String id, String fundName, Long totalFundWld, Long protectionLimitPerUser,
                           Long totalInsuredDepositsWld, Long cumulativePremiumsCollectedWld,
                           Long cumulativePayoutsWld, Boolean isEmergencyMode, String updatedAt) {
            this.id = id;
            this.fundName = fundName;
            this.totalFundWld = totalFundWld;
            this.protectionLimitPerUser = protectionLimitPerUser;
            this.totalInsuredDepositsWld = totalInsuredDepositsWld;
            this.cumulativePremiumsCollectedWld = cumulativePremiumsCollectedWld;
            this.cumulativePayoutsWld = cumulativePayoutsWld;
            this.isEmergencyMode = isEmergencyMode;
            this.updatedAt = updatedAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getFundName() { return fundName; }
        public void setFundName(String fundName) { this.fundName = fundName; }
        public Long getTotalFundWld() { return totalFundWld; }
        public void setTotalFundWld(Long totalFundWld) { this.totalFundWld = totalFundWld; }
        public Long getProtectionLimitPerUser() { return protectionLimitPerUser; }
        public void setProtectionLimitPerUser(Long protectionLimitPerUser) { this.protectionLimitPerUser = protectionLimitPerUser; }
        public Long getTotalInsuredDepositsWld() { return totalInsuredDepositsWld; }
        public void setTotalInsuredDepositsWld(Long totalInsuredDepositsWld) { this.totalInsuredDepositsWld = totalInsuredDepositsWld; }
        public Long getCumulativePremiumsCollectedWld() { return cumulativePremiumsCollectedWld; }
        public void setCumulativePremiumsCollectedWld(Long cumulativePremiumsCollectedWld) { this.cumulativePremiumsCollectedWld = cumulativePremiumsCollectedWld; }
        public Long getCumulativePayoutsWld() { return cumulativePayoutsWld; }
        public void setCumulativePayoutsWld(Long cumulativePayoutsWld) { this.cumulativePayoutsWld = cumulativePayoutsWld; }
        public Boolean getIsEmergencyMode() { return isEmergencyMode; }
        public void setIsEmergencyMode(Boolean isEmergencyMode) { this.isEmergencyMode = isEmergencyMode; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class InsuredInstitutionDto {
        private String id;
        private String institutionName;
        private String institutionType;
        private Double reportedBisRatioPct;
        private Long totalDepositsWld;
        private String status;
        private String lastInspectedAt;

        public InsuredInstitutionDto() {}

        public InsuredInstitutionDto(String id, String institutionName, String institutionType,
                                     Double reportedBisRatioPct, Long totalDepositsWld, String status, String lastInspectedAt) {
            this.id = id;
            this.institutionName = institutionName;
            this.institutionType = institutionType;
            this.reportedBisRatioPct = reportedBisRatioPct;
            this.totalDepositsWld = totalDepositsWld;
            this.status = status;
            this.lastInspectedAt = lastInspectedAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getInstitutionName() { return institutionName; }
        public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
        public String getInstitutionType() { return institutionType; }
        public void setInstitutionType(String institutionType) { this.institutionType = institutionType; }
        public Double getReportedBisRatioPct() { return reportedBisRatioPct; }
        public void setReportedBisRatioPct(Double reportedBisRatioPct) { this.reportedBisRatioPct = reportedBisRatioPct; }
        public Long getTotalDepositsWld() { return totalDepositsWld; }
        public void setTotalDepositsWld(Long totalDepositsWld) { this.totalDepositsWld = totalDepositsWld; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getLastInspectedAt() { return lastInspectedAt; }
        public void setLastInspectedAt(String lastInspectedAt) { this.lastInspectedAt = lastInspectedAt; }
    }

    public static class KdicSummaryDto {
        private Integer totalInstitutionsCount;
        private Double averageBisRatioPct;
        private Double reserveCoverageRatioPct;

        public KdicSummaryDto() {}
        public KdicSummaryDto(Integer totalInstitutionsCount, Double averageBisRatioPct, Double reserveCoverageRatioPct) {
            this.totalInstitutionsCount = totalInstitutionsCount;
            this.averageBisRatioPct = averageBisRatioPct;
            this.reserveCoverageRatioPct = reserveCoverageRatioPct;
        }

        public Integer getTotalInstitutionsCount() { return totalInstitutionsCount; }
        public void setTotalInstitutionsCount(Integer totalInstitutionsCount) { this.totalInstitutionsCount = totalInstitutionsCount; }
        public Double getAverageBisRatioPct() { return averageBisRatioPct; }
        public void setAverageBisRatioPct(Double averageBisRatioPct) { this.averageBisRatioPct = averageBisRatioPct; }
        public Double getReserveCoverageRatioPct() { return reserveCoverageRatioPct; }
        public void setReserveCoverageRatioPct(Double reserveCoverageRatioPct) { this.reserveCoverageRatioPct = reserveCoverageRatioPct; }
    }

    public static class PremiumRecordDto {
        private String id;
        private String institutionId;
        private String institutionName;
        private String quarterPeriod;
        private Long premiumAmountWld;
        private String status;
        private String assessedAt;

        public PremiumRecordDto() {}
        public PremiumRecordDto(String id, String institutionId, String institutionName, String quarterPeriod, Long premiumAmountWld, String status, String assessedAt) {
            this.id = id;
            this.institutionId = institutionId;
            this.institutionName = institutionName;
            this.quarterPeriod = quarterPeriod;
            this.premiumAmountWld = premiumAmountWld;
            this.status = status;
            this.assessedAt = assessedAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getInstitutionId() { return institutionId; }
        public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }
        public String getInstitutionName() { return institutionName; }
        public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
        public String getQuarterPeriod() { return quarterPeriod; }
        public void setQuarterPeriod(String quarterPeriod) { this.quarterPeriod = quarterPeriod; }
        public Long getPremiumAmountWld() { return premiumAmountWld; }
        public void setPremiumAmountWld(Long premiumAmountWld) { this.premiumAmountWld = premiumAmountWld; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAssessedAt() { return assessedAt; }
        public void setAssessedAt(String assessedAt) { this.assessedAt = assessedAt; }
    }

    public static class PayoutRecordDto {
        private String id;
        private String institutionId;
        private String institutionName;
        private String userId;
        private String displayName;
        private Long originalDepositWld;
        private Long payoutAmountWld;
        private String createdAt;

        public PayoutRecordDto() {}
        public PayoutRecordDto(String id, String institutionId, String institutionName, String userId, String displayName, Long originalDepositWld, Long payoutAmountWld, String createdAt) {
            this.id = id;
            this.institutionId = institutionId;
            this.institutionName = institutionName;
            this.userId = userId;
            this.displayName = displayName;
            this.originalDepositWld = originalDepositWld;
            this.payoutAmountWld = payoutAmountWld;
            this.createdAt = createdAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getInstitutionId() { return institutionId; }
        public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }
        public String getInstitutionName() { return institutionName; }
        public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public Long getOriginalDepositWld() { return originalDepositWld; }
        public void setOriginalDepositWld(Long originalDepositWld) { this.originalDepositWld = originalDepositWld; }
        public Long getPayoutAmountWld() { return payoutAmountWld; }
        public void setPayoutAmountWld(Long payoutAmountWld) { this.payoutAmountWld = payoutAmountWld; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class KdicOverviewResponse {
        private KdicFundDto fund;
        private List<InsuredInstitutionDto> institutions;
        private KdicSummaryDto summary;
        private List<PremiumRecordDto> recentPremiums;
        private List<PayoutRecordDto> recentPayouts;

        public KdicOverviewResponse() {}
        public KdicOverviewResponse(KdicFundDto fund, List<InsuredInstitutionDto> institutions, KdicSummaryDto summary, List<PremiumRecordDto> recentPremiums, List<PayoutRecordDto> recentPayouts) {
            this.fund = fund;
            this.institutions = institutions;
            this.summary = summary;
            this.recentPremiums = recentPremiums;
            this.recentPayouts = recentPayouts;
        }

        public KdicFundDto getFund() { return fund; }
        public void setFund(KdicFundDto fund) { this.fund = fund; }
        public List<InsuredInstitutionDto> getInstitutions() { return institutions; }
        public void setInstitutions(List<InsuredInstitutionDto> institutions) { this.institutions = institutions; }
        public KdicSummaryDto getSummary() { return summary; }
        public void setSummary(KdicSummaryDto summary) { this.summary = summary; }
        public List<PremiumRecordDto> getRecentPremiums() { return recentPremiums; }
        public void setRecentPremiums(List<PremiumRecordDto> recentPremiums) { this.recentPremiums = recentPremiums; }
        public List<PayoutRecordDto> getRecentPayouts() { return recentPayouts; }
        public void setRecentPayouts(List<PayoutRecordDto> recentPayouts) { this.recentPayouts = recentPayouts; }
    }

    public static class KdicLedgerEvidenceDto {
        private Boolean numericBalanced;
        private Long transactionCount;
        private Long unbalancedTransactionCount;
        private Long mismatchedAccountCount;
        private Long accountCount;
        private Long absoluteDifferenceWld;
        private Long unlinkedTreasuryCount;
        private Long treasuryRecordCount;
        private String checkedAt;

        public KdicLedgerEvidenceDto() {}
        public KdicLedgerEvidenceDto(Boolean numericBalanced, Long transactionCount, Long unbalancedTransactionCount, Long mismatchedAccountCount, Long accountCount, Long absoluteDifferenceWld, Long unlinkedTreasuryCount, Long treasuryRecordCount, String checkedAt) {
            this.numericBalanced = numericBalanced;
            this.transactionCount = transactionCount;
            this.unbalancedTransactionCount = unbalancedTransactionCount;
            this.mismatchedAccountCount = mismatchedAccountCount;
            this.accountCount = accountCount;
            this.absoluteDifferenceWld = absoluteDifferenceWld;
            this.unlinkedTreasuryCount = unlinkedTreasuryCount;
            this.treasuryRecordCount = treasuryRecordCount;
            this.checkedAt = checkedAt;
        }

        public Boolean getNumericBalanced() { return numericBalanced; }
        public void setNumericBalanced(Boolean numericBalanced) { this.numericBalanced = numericBalanced; }
        public Long getTransactionCount() { return transactionCount; }
        public void setTransactionCount(Long transactionCount) { this.transactionCount = transactionCount; }
        public Long getUnbalancedTransactionCount() { return unbalancedTransactionCount; }
        public void setUnbalancedTransactionCount(Long unbalancedTransactionCount) { this.unbalancedTransactionCount = unbalancedTransactionCount; }
        public Long getMismatchedAccountCount() { return mismatchedAccountCount; }
        public void setMismatchedAccountCount(Long mismatchedAccountCount) { this.mismatchedAccountCount = mismatchedAccountCount; }
        public Long getAccountCount() { return accountCount; }
        public void setAccountCount(Long accountCount) { this.accountCount = accountCount; }
        public Long getAbsoluteDifferenceWld() { return absoluteDifferenceWld; }
        public void setAbsoluteDifferenceWld(Long absoluteDifferenceWld) { this.absoluteDifferenceWld = absoluteDifferenceWld; }
        public Long getUnlinkedTreasuryCount() { return unlinkedTreasuryCount; }
        public void setUnlinkedTreasuryCount(Long unlinkedTreasuryCount) { this.unlinkedTreasuryCount = unlinkedTreasuryCount; }
        public Long getTreasuryRecordCount() { return treasuryRecordCount; }
        public void setTreasuryRecordCount(Long treasuryRecordCount) { this.treasuryRecordCount = treasuryRecordCount; }
        public String getCheckedAt() { return checkedAt; }
        public void setCheckedAt(String checkedAt) { this.checkedAt = checkedAt; }
    }
}
