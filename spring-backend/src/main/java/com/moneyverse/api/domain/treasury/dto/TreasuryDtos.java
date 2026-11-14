package com.moneyverse.api.domain.treasury.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class TreasuryDtos {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MintTopupRequest {
        @NotNull(message = "amountWld is required")
        @Min(value = 1, message = "amountWld must be greater than 0")
        private Long amountWld;

        @NotBlank(message = "reason must not be blank")
        private String reason;

        private String otpCode;
        private String requestKey;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalaryDisburseRequest {
        @NotNull(message = "amountWld is required")
        @Min(value = 1, message = "amountWld must be greater than 0")
        private Long amountWld;

        private String otpCode;
        private String requestKey;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SwfRebalanceRequest {
        private String strategy;
        private Boolean force;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SwfLiquidateRequest {
        @NotNull(message = "amountWld is required")
        @Min(value = 1, message = "amountWld must be greater than 0")
        private Long amountWld;

        private String reason;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TreasuryOperationResult {
        private boolean success;
        private String txId;
        private String vaultCode;
        private Long amountWld;
        private Long newVaultBalanceWld;
        private String reason;
        private String executedAt;
    }
}
