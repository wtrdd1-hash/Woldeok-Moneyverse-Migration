package com.moneyverse.api.domain.treasury.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TreasuryDtos {

    public static class MintTopupRequest {
        @NotNull(message = "amountWld is required")
        @Min(value = 1, message = "amountWld must be greater than 0")
        private Long amountWld;

        @NotBlank(message = "reason must not be blank")
        private String reason;

        private String otpCode;
        private String requestKey;

        public MintTopupRequest() {}

        public MintTopupRequest(Long amountWld, String reason, String otpCode, String requestKey) {
            this.amountWld = amountWld;
            this.reason = reason;
            this.otpCode = otpCode;
            this.requestKey = requestKey;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long amountWld;
            private String reason;
            private String otpCode;
            private String requestKey;

            public Builder amountWld(Long amountWld) { this.amountWld = amountWld; return this; }
            public Builder reason(String reason) { this.reason = reason; return this; }
            public Builder otpCode(String otpCode) { this.otpCode = otpCode; return this; }
            public Builder requestKey(String requestKey) { this.requestKey = requestKey; return this; }
            public MintTopupRequest build() { return new MintTopupRequest(amountWld, reason, otpCode, requestKey); }
        }

        public Long getAmountWld() { return amountWld; }
        public void setAmountWld(Long amountWld) { this.amountWld = amountWld; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getOtpCode() { return otpCode; }
        public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
        public String getRequestKey() { return requestKey; }
        public void setRequestKey(String requestKey) { this.requestKey = requestKey; }
    }

    public static class SalaryDisburseRequest {
        @NotNull(message = "amountWld is required")
        @Min(value = 1, message = "amountWld must be greater than 0")
        private Long amountWld;

        private String otpCode;
        private String requestKey;

        public SalaryDisburseRequest() {}

        public SalaryDisburseRequest(Long amountWld, String otpCode, String requestKey) {
            this.amountWld = amountWld;
            this.otpCode = otpCode;
            this.requestKey = requestKey;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long amountWld;
            private String otpCode;
            private String requestKey;

            public Builder amountWld(Long amountWld) { this.amountWld = amountWld; return this; }
            public Builder otpCode(String otpCode) { this.otpCode = otpCode; return this; }
            public Builder requestKey(String requestKey) { this.requestKey = requestKey; return this; }
            public SalaryDisburseRequest build() { return new SalaryDisburseRequest(amountWld, otpCode, requestKey); }
        }

        public Long getAmountWld() { return amountWld; }
        public void setAmountWld(Long amountWld) { this.amountWld = amountWld; }
        public String getOtpCode() { return otpCode; }
        public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
        public String getRequestKey() { return requestKey; }
        public void setRequestKey(String requestKey) { this.requestKey = requestKey; }
    }

    public static class SwfRebalanceRequest {
        private String strategy;
        private Boolean force;

        public SwfRebalanceRequest() {}
        public SwfRebalanceRequest(String strategy, Boolean force) {
            this.strategy = strategy;
            this.force = force;
        }

        public String getStrategy() { return strategy; }
        public void setStrategy(String strategy) { this.strategy = strategy; }
        public Boolean getForce() { return force; }
        public void setForce(Boolean force) { this.force = force; }
    }

    public static class SwfLiquidateRequest {
        @NotNull(message = "amountWld is required")
        @Min(value = 1, message = "amountWld must be greater than 0")
        private Long amountWld;
        private String reason;

        public SwfLiquidateRequest() {}
        public SwfLiquidateRequest(Long amountWld, String reason) {
            this.amountWld = amountWld;
            this.reason = reason;
        }

        public Long getAmountWld() { return amountWld; }
        public void setAmountWld(Long amountWld) { this.amountWld = amountWld; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class TreasuryOperationResult {
        private boolean success;
        private String txId;
        private String vaultCode;
        private Long amountWld;
        private Long newVaultBalanceWld;
        private String reason;
        private String executedAt;

        public TreasuryOperationResult() {}

        public TreasuryOperationResult(boolean success, String txId, String vaultCode, Long amountWld, Long newVaultBalanceWld, String reason, String executedAt) {
            this.success = success;
            this.txId = txId;
            this.vaultCode = vaultCode;
            this.amountWld = amountWld;
            this.newVaultBalanceWld = newVaultBalanceWld;
            this.reason = reason;
            this.executedAt = executedAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private boolean success;
            private String txId;
            private String vaultCode;
            private Long amountWld;
            private Long newVaultBalanceWld;
            private String reason;
            private String executedAt;

            public Builder success(boolean success) { this.success = success; return this; }
            public Builder txId(String txId) { this.txId = txId; return this; }
            public Builder vaultCode(String vaultCode) { this.vaultCode = vaultCode; return this; }
            public Builder amountWld(Long amountWld) { this.amountWld = amountWld; return this; }
            public Builder newVaultBalanceWld(Long newVaultBalanceWld) { this.newVaultBalanceWld = newVaultBalanceWld; return this; }
            public Builder reason(String reason) { this.reason = reason; return this; }
            public Builder executedAt(String executedAt) { this.executedAt = executedAt; return this; }
            public TreasuryOperationResult build() {
                return new TreasuryOperationResult(success, txId, vaultCode, amountWld, newVaultBalanceWld, reason, executedAt);
            }
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getTxId() { return txId; }
        public void setTxId(String txId) { this.txId = txId; }
        public String getVaultCode() { return vaultCode; }
        public void setVaultCode(String vaultCode) { this.vaultCode = vaultCode; }
        public Long getAmountWld() { return amountWld; }
        public void setAmountWld(Long amountWld) { this.amountWld = amountWld; }
        public Long getNewVaultBalanceWld() { return newVaultBalanceWld; }
        public void setNewVaultBalanceWld(Long newVaultBalanceWld) { this.newVaultBalanceWld = newVaultBalanceWld; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getExecutedAt() { return executedAt; }
        public void setExecutedAt(String executedAt) { this.executedAt = executedAt; }
    }
}
