package com.moneyverse.api.domain.bank.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

public class BankDtos {

    public static class BankStanding {
        private String cashBalanceWld;
        private String depositBalanceWld;
        private String accruedInterestWld;
        private String depositInterestRateAnnualPercent;
        private String loanBalanceWld;
        private String bondHoldingsValueWld;

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
        public String getLoanBalanceWld() { return loanBalanceWld; }
        public void setLoanBalanceWld(String loanBalanceWld) { this.loanBalanceWld = loanBalanceWld; }
        public String getBondHoldingsValueWld() { return bondHoldingsValueWld; }
        public void setBondHoldingsValueWld(String bondHoldingsValueWld) { this.bondHoldingsValueWld = bondHoldingsValueWld; }
    }

    public static class BankTransferRequest {
        @NotNull(message = "amountWld is required")
        @Min(value = 1, message = "amountWld must be at least 1")
        @JsonAlias({"amount", "amount_wld", "amountWld"})
        private Long amountWld;

        @JsonAlias({"idempotencyKey", "idempotency_key", "requestKey"})
        private String idempotencyKey;

        public BankTransferRequest() {}

        public Long getAmountWld() { return amountWld; }
        public void setAmountWld(Long amountWld) { this.amountWld = amountWld; }
        public String getIdempotencyKey() { return idempotencyKey; }
        public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    }
}
