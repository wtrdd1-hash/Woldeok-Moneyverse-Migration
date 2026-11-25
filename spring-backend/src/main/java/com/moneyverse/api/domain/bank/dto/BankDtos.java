package com.moneyverse.api.domain.bank.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

public class BankDtos {

    public static class BankStanding {
        private String cashBalanceWld;
        private String depositBalanceWld;
        private String accruedInterestWld;
        private String depositInterestRateAnnualPercent;
        private String dailyInterestRatePct;
        private String creditGrade;
        private String creditLimitWld;
        private String loanBalanceWld;
        private String bondHoldingsValueWld;
        private Map<String, Object> activeLoan;
        private List<Map<String, Object>> bonds;
        /** public.bank_get_my_standing object, unmodified (Next contract; QA 2026-11-25). */
        private Map<String, Object> canonical;

        public Map<String, Object> getCanonical() { return canonical; }
        public void setCanonical(Map<String, Object> canonical) { this.canonical = canonical; }

        public BankStanding() {}

        public BankStanding(String cashBalanceWld, String depositBalanceWld, String accruedInterestWld,
                            String depositInterestRateAnnualPercent, String loanBalanceWld, String bondHoldingsValueWld) {
            this.cashBalanceWld = cashBalanceWld;
            this.depositBalanceWld = depositBalanceWld;
            this.accruedInterestWld = accruedInterestWld;
            this.depositInterestRateAnnualPercent = depositInterestRateAnnualPercent;
            this.loanBalanceWld = loanBalanceWld;
            this.bondHoldingsValueWld = bondHoldingsValueWld;
        }

        public String getCashBalanceWld() { return cashBalanceWld; }
        public void setCashBalanceWld(String cashBalanceWld) { this.cashBalanceWld = cashBalanceWld; }
        public String getDepositBalanceWld() { return depositBalanceWld; }
        public void setDepositBalanceWld(String depositBalanceWld) { this.depositBalanceWld = depositBalanceWld; }
        public String getAccruedInterestWld() { return accruedInterestWld; }
        public void setAccruedInterestWld(String accruedInterestWld) { this.accruedInterestWld = accruedInterestWld; }
        public String getDepositInterestRateAnnualPercent() { return depositInterestRateAnnualPercent; }
        public void setDepositInterestRateAnnualPercent(String depositInterestRateAnnualPercent) { this.depositInterestRateAnnualPercent = depositInterestRateAnnualPercent; }
        public String getDailyInterestRatePct() { return dailyInterestRatePct; }
        public void setDailyInterestRatePct(String dailyInterestRatePct) { this.dailyInterestRatePct = dailyInterestRatePct; }
        public String getCreditGrade() { return creditGrade; }
        public void setCreditGrade(String creditGrade) { this.creditGrade = creditGrade; }
        public String getCreditLimitWld() { return creditLimitWld; }
        public void setCreditLimitWld(String creditLimitWld) { this.creditLimitWld = creditLimitWld; }
        public String getLoanBalanceWld() { return loanBalanceWld; }
        public void setLoanBalanceWld(String loanBalanceWld) { this.loanBalanceWld = loanBalanceWld; }
        public String getBondHoldingsValueWld() { return bondHoldingsValueWld; }
        public void setBondHoldingsValueWld(String bondHoldingsValueWld) { this.bondHoldingsValueWld = bondHoldingsValueWld; }
        public Map<String, Object> getActiveLoan() { return activeLoan; }
        public void setActiveLoan(Map<String, Object> activeLoan) { this.activeLoan = activeLoan; }
        public List<Map<String, Object>> getBonds() { return bonds; }
        public void setBonds(List<Map<String, Object>> bonds) { this.bonds = bonds; }
    }

    public static class BankTransferRequest {
        @NotNull(message = "amountWld is required")
        @Min(value = 1, message = "amountWld must be at least 1")
        @JsonAlias({"amount", "amount_wld", "amountWld"})
        private Long amountWld;

        @JsonAlias({"direction", "type"})
        private String direction;

        @JsonAlias({"idempotencyKey", "idempotency_key", "requestKey"})
        private String idempotencyKey;

        public BankTransferRequest() {}

        public Long getAmountWld() { return amountWld; }
        public void setAmountWld(Long amountWld) { this.amountWld = amountWld; }
        public String getDirection() { return direction; }
        public void setDirection(String direction) { this.direction = direction; }
        public String getIdempotencyKey() { return idempotencyKey; }
        public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    }

    public static class PocketCreateRequest {
        @NotNull(message = "name is required")
        private String name;

        @JsonAlias({"targetAmount", "target_amount"})
        private Long targetAmount;

        @JsonAlias({"themeColor", "theme_color"})
        private String themeColor;

        @JsonAlias({"iconCode", "icon_code"})
        private String iconCode;

        public PocketCreateRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Long getTargetAmount() { return targetAmount; }
        public void setTargetAmount(Long targetAmount) { this.targetAmount = targetAmount; }
        public String getThemeColor() { return themeColor; }
        public void setThemeColor(String themeColor) { this.themeColor = themeColor; }
        public String getIconCode() { return iconCode; }
        public void setIconCode(String iconCode) { this.iconCode = iconCode; }
    }

    public static class PocketTransferRequest {
        @NotNull(message = "amountWld is required")
        @Min(value = 1, message = "amountWld must be at least 1")
        @JsonAlias({"amount", "amount_wld", "amountWld"})
        private Long amountWld;

        @NotNull(message = "direction is required (deposit or withdraw)")
        private String direction; // "deposit" (bank -> pocket) or "withdraw" (pocket -> bank)

        @JsonAlias({"idempotencyKey", "idempotency_key"})
        private String idempotencyKey;

        public PocketTransferRequest() {}

        public Long getAmountWld() { return amountWld; }
        public void setAmountWld(Long amountWld) { this.amountWld = amountWld; }
        public String getDirection() { return direction; }
        public void setDirection(String direction) { this.direction = direction; }
        public String getIdempotencyKey() { return idempotencyKey; }
        public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    }

    public static class LoanRequest {
        @NotNull(message = "amountWld is required")
        @Min(value = 1, message = "amountWld must be at least 1")
        @JsonAlias({"principalAmount", "principal_amount", "amountWld", "amount"})
        private Long principalAmount;

        @JsonAlias({"loanId", "loan_id"})
        private String loanId;

        @JsonAlias({"idempotencyKey", "idempotency_key"})
        private String idempotencyKey;

        public LoanRequest() {}

        public Long getPrincipalAmount() { return principalAmount; }
        public void setPrincipalAmount(Long principalAmount) { this.principalAmount = principalAmount; }
        public String getLoanId() { return loanId; }
        public void setLoanId(String loanId) { this.loanId = loanId; }
        public String getIdempotencyKey() { return idempotencyKey; }
        public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    }
}
