package com.moneyverse.api.domain.admin.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public class AdminGovernanceDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FeatureSwitchDto {
        @JsonProperty("feature_key")
        @JsonAlias({"featureKey", "feature_key"})
        private String featureKey;

        @JsonProperty("state")
        private String state;

        @JsonProperty("title")
        private String title;

        @JsonProperty("activation_preconditions")
        @JsonAlias({"activationPreconditions", "activation_preconditions"})
        private Object activationPreconditions;

        @JsonProperty("reason")
        private String reason;

        @JsonProperty("updated_by")
        @JsonAlias({"updatedBy", "updated_by"})
        private String updatedBy;

        @JsonProperty("updated_at")
        @JsonAlias({"updatedAt", "updated_at"})
        private String updatedAt;

        public FeatureSwitchDto() {}

        public FeatureSwitchDto(String featureKey, String state, String title, Object activationPreconditions, String reason, String updatedBy, String updatedAt) {
            this.featureKey = featureKey;
            this.state = state;
            this.title = title;
            this.activationPreconditions = activationPreconditions;
            this.reason = reason;
            this.updatedBy = updatedBy;
            this.updatedAt = updatedAt;
        }

        public String getFeatureKey() { return featureKey; }
        public void setFeatureKey(String featureKey) { this.featureKey = featureKey; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public Object getActivationPreconditions() { return activationPreconditions; }
        public void setActivationPreconditions(Object activationPreconditions) { this.activationPreconditions = activationPreconditions; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public String getUpdatedBy() { return updatedBy; }
        public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class FeatureSwitchOverviewResponse {
        @JsonProperty("featureSwitches")
        @JsonAlias({"feature_switches", "featureSwitches"})
        private List<FeatureSwitchDto> featureSwitches;

        @JsonProperty("policies")
        private List<Map<String, Object>> policies;

        @JsonProperty("roles")
        private List<Map<String, Object>> roles;

        public FeatureSwitchOverviewResponse() {}

        public FeatureSwitchOverviewResponse(List<FeatureSwitchDto> featureSwitches, List<Map<String, Object>> policies, List<Map<String, Object>> roles) {
            this.featureSwitches = featureSwitches;
            this.policies = policies;
            this.roles = roles;
        }

        public List<FeatureSwitchDto> getFeatureSwitches() { return featureSwitches; }
        public void setFeatureSwitches(List<FeatureSwitchDto> featureSwitches) { this.featureSwitches = featureSwitches; }

        public List<Map<String, Object>> getPolicies() { return policies; }
        public void setPolicies(List<Map<String, Object>> policies) { this.policies = policies; }

        public List<Map<String, Object>> getRoles() { return roles; }
        public void setRoles(List<Map<String, Object>> roles) { this.roles = roles; }
    }

    public static class SetFeatureSwitchRequest {
        @NotNull
        @JsonProperty("state")
        private String state;

        @NotNull
        @Size(min = 10, max = 1000)
        @JsonProperty("reason")
        private String reason;

        @JsonProperty("idempotencyKey")
        @JsonAlias({"idempotency_key", "idempotencyKey"})
        private String idempotencyKey;

        public SetFeatureSwitchRequest() {}

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public String getIdempotencyKey() { return idempotencyKey; }
        public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AdminUserDto {
        @JsonProperty("user_id")
        @JsonAlias({"userId", "user_id"})
        private String userId;

        @JsonProperty("status")
        private String status;

        @JsonProperty("display_name")
        @JsonAlias({"displayName", "display_name"})
        private String displayName;

        @JsonProperty("created_at")
        @JsonAlias({"createdAt", "created_at"})
        private String createdAt;

        @JsonProperty("restricted_at")
        @JsonAlias({"restrictedAt", "restricted_at"})
        private String restrictedAt;

        @JsonProperty("restriction_reason")
        @JsonAlias({"restrictionReason", "restriction_reason"})
        private String restrictionReason;

        @JsonProperty("cash_balance")
        @JsonAlias({"cashBalance", "cash_balance"})
        private String cashBalance;

        @JsonProperty("bank_balance")
        @JsonAlias({"bankBalance", "bank_balance"})
        private String bankBalance;

        @JsonProperty("bond_balance")
        @JsonAlias({"bondBalance", "bond_balance"})
        private String bondBalance;

        @JsonProperty("stock_eval")
        @JsonAlias({"stockEval", "stock_eval"})
        private String stockEval;

        @JsonProperty("total_net_worth")
        @JsonAlias({"totalNetWorth", "total_net_worth"})
        private String totalNetWorth;

        @JsonProperty("wealth_rank")
        @JsonAlias({"wealthRank", "wealth_rank"})
        @JsonInclude(JsonInclude.Include.ALWAYS)
        private Integer wealthRank;

        @JsonProperty("last_login_at")
        @JsonAlias({"lastLoginAt", "last_login_at"})
        private String lastLoginAt;

        @JsonProperty("last_seen_at")
        @JsonAlias({"lastSeenAt", "last_seen_at"})
        private String lastSeenAt;

        @JsonProperty("last_admin_at")
        @JsonAlias({"lastAdminAt", "last_admin_at"})
        private String lastAdminAt;

        @JsonProperty("is_admin")
        @JsonAlias({"isAdmin", "is_admin"})
        private boolean isAdmin;

        public AdminUserDto() {}

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

        public String getRestrictedAt() { return restrictedAt; }
        public void setRestrictedAt(String restrictedAt) { this.restrictedAt = restrictedAt; }

        public String getRestrictionReason() { return restrictionReason; }
        public void setRestrictionReason(String restrictionReason) { this.restrictionReason = restrictionReason; }

        public String getCashBalance() { return cashBalance; }
        public void setCashBalance(String cashBalance) { this.cashBalance = cashBalance; }

        public String getBankBalance() { return bankBalance; }
        public void setBankBalance(String bankBalance) { this.bankBalance = bankBalance; }

        public String getBondBalance() { return bondBalance; }
        public void setBondBalance(String bondBalance) { this.bondBalance = bondBalance; }

        public String getStockEval() { return stockEval; }
        public void setStockEval(String stockEval) { this.stockEval = stockEval; }

        public String getTotalNetWorth() { return totalNetWorth; }
        public void setTotalNetWorth(String totalNetWorth) { this.totalNetWorth = totalNetWorth; }

        public Integer getWealthRank() { return wealthRank; }
        public void setWealthRank(Integer wealthRank) { this.wealthRank = wealthRank; }

        public String getLastLoginAt() { return lastLoginAt; }
        public void setLastLoginAt(String lastLoginAt) { this.lastLoginAt = lastLoginAt; }

        public String getLastSeenAt() { return lastSeenAt; }
        public void setLastSeenAt(String lastSeenAt) { this.lastSeenAt = lastSeenAt; }

        public String getLastAdminAt() { return lastAdminAt; }
        public void setLastAdminAt(String lastAdminAt) { this.lastAdminAt = lastAdminAt; }

        public boolean getIsAdmin() { return isAdmin; }
        public void setIsAdmin(boolean isAdmin) { this.isAdmin = isAdmin; }
    }

    public static class AdminUsersResponse {
        @JsonProperty("users")
        private List<AdminUserDto> users;

        @JsonProperty("scope")
        private Map<String, Object> scope;

        public AdminUsersResponse() {}

        public AdminUsersResponse(List<AdminUserDto> users, Map<String, Object> scope) {
            this.users = users;
            this.scope = scope;
        }

        public List<AdminUserDto> getUsers() { return users; }
        public void setUsers(List<AdminUserDto> users) { this.users = users; }

        public Map<String, Object> getScope() { return scope; }
        public void setScope(Map<String, Object> scope) { this.scope = scope; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AdminStockDto {
        @JsonProperty("id")
        private String id;

        @JsonProperty("symbol")
        private String symbol;

        @JsonProperty("name")
        private String name;

        @JsonProperty("current_price")
        @JsonAlias({"currentPrice", "current_price"})
        private String currentPrice;

        @JsonProperty("active")
        private boolean active;

        @JsonProperty("halt_status")
        @JsonAlias({"haltStatus", "halt_status"})
        private String haltStatus;

        @JsonProperty("halt_reason")
        @JsonAlias({"haltReason", "halt_reason"})
        private String haltReason;

        public AdminStockDto() {}

        public AdminStockDto(String id, String symbol, String name, String currentPrice, boolean active, String haltStatus, String haltReason) {
            this.id = id;
            this.symbol = symbol;
            this.name = name;
            this.currentPrice = currentPrice;
            this.active = active;
            this.haltStatus = haltStatus;
            this.haltReason = haltReason;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCurrentPrice() { return currentPrice; }
        public void setCurrentPrice(String currentPrice) { this.currentPrice = currentPrice; }

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }

        public String getHaltStatus() { return haltStatus; }
        public void setHaltStatus(String haltStatus) { this.haltStatus = haltStatus; }

        public String getHaltReason() { return haltReason; }
        public void setHaltReason(String haltReason) { this.haltReason = haltReason; }
    }

    public static class AdminStocksResponse {
        @JsonProperty("stocks")
        private List<AdminStockDto> stocks;

        public AdminStocksResponse() {}
        public AdminStocksResponse(List<AdminStockDto> stocks) { this.stocks = stocks; }

        public List<AdminStockDto> getStocks() { return stocks; }
        public void setStocks(List<AdminStockDto> stocks) { this.stocks = stocks; }
    }

    public static class EconomyReconciliationHealthDto {
        @JsonProperty("available")
        private boolean available;

        @JsonProperty("snapshot_id")
        @JsonAlias({"snapshotId", "snapshot_id"})
        private String snapshotId;

        @JsonProperty("metric_version")
        @JsonAlias({"metricVersion", "metric_version"})
        private String metricVersion;

        @JsonProperty("calculatedAt")
        @JsonAlias({"calculated_at", "calculatedAt"})
        private String calculatedAt;

        @JsonProperty("integrity")
        private IntegrityDto integrity;

        public EconomyReconciliationHealthDto() {}

        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }

        public String getSnapshotId() { return snapshotId; }
        public void setSnapshotId(String snapshotId) { this.snapshotId = snapshotId; }

        public String getMetricVersion() { return metricVersion; }
        public void setMetricVersion(String metricVersion) { this.metricVersion = metricVersion; }

        public String getCalculatedAt() { return calculatedAt; }
        public void setCalculatedAt(String calculatedAt) { this.calculatedAt = calculatedAt; }

        public IntegrityDto getIntegrity() { return integrity; }
        public void setIntegrity(IntegrityDto integrity) { this.integrity = integrity; }

        public static class IntegrityDto {
            @JsonProperty("ok")
            private boolean ok;

            @JsonProperty("ledgerTransactionCount")
            @JsonAlias({"ledger_transaction_count", "ledgerTransactionCount"})
            private String ledgerTransactionCount;

            @JsonProperty("ledgerPostingCount")
            @JsonAlias({"ledger_posting_count", "ledgerPostingCount"})
            private String ledgerPostingCount;

            @JsonProperty("unbalancedTransactionCount")
            @JsonAlias({"unbalanced_transaction_count", "unbalancedTransactionCount", "ledger_unbalanced_transaction_count"})
            private String unbalancedTransactionCount;

            @JsonProperty("missingBalanceAccountCount")
            @JsonAlias({"missing_balance_account_count", "missingBalanceAccountCount"})
            private String missingBalanceAccountCount;

            @JsonProperty("balanceMismatchAccountCount")
            @JsonAlias({"balance_mismatch_account_count", "balanceMismatchAccountCount"})
            private String balanceMismatchAccountCount;

            @JsonProperty("disallowedNegativeBalanceAccountCount")
            @JsonAlias({"disallowed_negative_balance_account_count", "disallowedNegativeBalanceAccountCount"})
            private String disallowedNegativeBalanceAccountCount;

            @JsonProperty("accountBalanceTotalAmount")
            @JsonAlias({"account_balance_total_amount", "accountBalanceTotalAmount"})
            private String accountBalanceTotalAmount;

            @JsonProperty("ledgerBalanceTotalAmount")
            @JsonAlias({"ledger_balance_total_amount", "ledgerBalanceTotalAmount"})
            private String ledgerBalanceTotalAmount;

            @JsonProperty("balanceTotalDeltaAmount")
            @JsonAlias({"balance_total_delta_amount", "balanceTotalDeltaAmount"})
            private String balanceTotalDeltaAmount;

            public IntegrityDto() {}

            public boolean isOk() { return ok; }
            public void setOk(boolean ok) { this.ok = ok; }

            public String getLedgerTransactionCount() { return ledgerTransactionCount; }
            public void setLedgerTransactionCount(String ledgerTransactionCount) { this.ledgerTransactionCount = ledgerTransactionCount; }

            public String getLedgerPostingCount() { return ledgerPostingCount; }
            public void setLedgerPostingCount(String ledgerPostingCount) { this.ledgerPostingCount = ledgerPostingCount; }

            public String getUnbalancedTransactionCount() { return unbalancedTransactionCount; }
            public void setUnbalancedTransactionCount(String unbalancedTransactionCount) { this.unbalancedTransactionCount = unbalancedTransactionCount; }

            public String getMissingBalanceAccountCount() { return missingBalanceAccountCount; }
            public void setMissingBalanceAccountCount(String missingBalanceAccountCount) { this.missingBalanceAccountCount = missingBalanceAccountCount; }

            public String getBalanceMismatchAccountCount() { return balanceMismatchAccountCount; }
            public void setBalanceMismatchAccountCount(String balanceMismatchAccountCount) { this.balanceMismatchAccountCount = balanceMismatchAccountCount; }

            public String getDisallowedNegativeBalanceAccountCount() { return disallowedNegativeBalanceAccountCount; }
            public void setDisallowedNegativeBalanceAccountCount(String disallowedNegativeBalanceAccountCount) { this.disallowedNegativeBalanceAccountCount = disallowedNegativeBalanceAccountCount; }

            public String getAccountBalanceTotalAmount() { return accountBalanceTotalAmount; }
            public void setAccountBalanceTotalAmount(String accountBalanceTotalAmount) { this.accountBalanceTotalAmount = accountBalanceTotalAmount; }

            public String getLedgerBalanceTotalAmount() { return ledgerBalanceTotalAmount; }
            public void setLedgerBalanceTotalAmount(String ledgerBalanceTotalAmount) { this.ledgerBalanceTotalAmount = ledgerBalanceTotalAmount; }

            public String getBalanceTotalDeltaAmount() { return balanceTotalDeltaAmount; }
            public void setBalanceTotalDeltaAmount(String balanceTotalDeltaAmount) { this.balanceTotalDeltaAmount = balanceTotalDeltaAmount; }
        }
    }
}
