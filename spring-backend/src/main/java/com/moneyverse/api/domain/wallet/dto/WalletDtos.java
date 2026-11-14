package com.moneyverse.api.domain.wallet.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class WalletDtos {

    public static class WalletOverview {
        private String balanceWld;
        private String pendingBalanceWld;
        private String lockedBalanceWld;
        private String currency;
        private String userId;
        private List<Map<String, Object>> recentTransactions;

        public WalletOverview() {}

        public WalletOverview(String balanceWld, String pendingBalanceWld, String lockedBalanceWld,
                              String currency, String userId, List<Map<String, Object>> recentTransactions) {
            this.balanceWld = balanceWld;
            this.pendingBalanceWld = pendingBalanceWld;
            this.lockedBalanceWld = lockedBalanceWld;
            this.currency = currency;
            this.userId = userId;
            this.recentTransactions = recentTransactions;
        }

        public String getBalanceWld() { return balanceWld; }
        public void setBalanceWld(String balanceWld) { this.balanceWld = balanceWld; }
        public String getPendingBalanceWld() { return pendingBalanceWld; }
        public void setPendingBalanceWld(String pendingBalanceWld) { this.pendingBalanceWld = pendingBalanceWld; }
        public String getLockedBalanceWld() { return lockedBalanceWld; }
        public void setLockedBalanceWld(String lockedBalanceWld) { this.lockedBalanceWld = lockedBalanceWld; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public List<Map<String, Object>> getRecentTransactions() { return recentTransactions; }
        public void setRecentTransactions(List<Map<String, Object>> recentTransactions) { this.recentTransactions = recentTransactions; }
    }

    public static class TransferRequest {
        @NotBlank(message = "recipientUserId is required")
        @JsonAlias({"recipientUserId", "toUserId", "recipient", "to_user_id"})
        private String recipientUserId;

        @NotNull(message = "amountWld is required")
        @Min(value = 1, message = "amountWld must be at least 1")
        @JsonAlias({"amount", "amount_wld", "amountWld"})
        private Long amountWld;

        private String memo;

        public TransferRequest() {}

        public String getRecipientUserId() { return recipientUserId; }
        public void setRecipientUserId(String recipientUserId) { this.recipientUserId = recipientUserId; }
        public Long getAmountWld() { return amountWld; }
        public void setAmountWld(Long amountWld) { this.amountWld = amountWld; }
        public String getMemo() { return memo; }
        public void setMemo(String memo) { this.memo = memo; }
    }
}
