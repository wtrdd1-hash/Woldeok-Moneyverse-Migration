package com.moneyverse.api.domain.admin.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;

public final class AdminChannelOtpDtos {

    private AdminChannelOtpDtos() {}

    public record OtpRequest(
            @JsonProperty("actionName") String actionName
    ) implements Serializable {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record OtpRequestResponse(
            @JsonProperty("ok") boolean ok,
            @JsonProperty("success") boolean success,
            @JsonProperty("expiresAt") long expiresAt,
            @JsonProperty("error") String error
    ) implements Serializable {
        public static OtpRequestResponse success(long expiresAt) {
            return new OtpRequestResponse(true, true, expiresAt, null);
        }
        public static OtpRequestResponse error(String message) {
            return new OtpRequestResponse(false, false, 0, message);
        }
    }

    public record OtpVerifyRequest(
            @JsonProperty("otpCode") String otpCode
    ) implements Serializable {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record OtpVerifyResponse(
            @JsonProperty("ok") boolean ok,
            @JsonProperty("verified") boolean verified,
            @JsonProperty("error") String error
    ) implements Serializable {
        public static OtpVerifyResponse success() {
            return new OtpVerifyResponse(true, true, null);
        }
        public static OtpVerifyResponse failure(String message) {
            return new OtpVerifyResponse(false, false, message);
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record OtpElevateResponse(
            @JsonProperty("ok") boolean ok,
            @JsonProperty("elevated") boolean elevated,
            @JsonProperty("expiresAt") Long expiresAt,
            @JsonProperty("error") String error
    ) implements Serializable {
        public static OtpElevateResponse success(long expiresAt) {
            return new OtpElevateResponse(true, true, expiresAt, null);
        }
        public static OtpElevateResponse failure(String message) {
            return new OtpElevateResponse(false, false, null, message);
        }
    }

    public record OtpStatusResponse(
            @JsonProperty("ok") boolean ok,
            @JsonProperty("elevated") boolean elevated,
            @JsonProperty("remainingSeconds") long remainingSeconds,
            @JsonProperty("expiresAt") long expiresAt
    ) implements Serializable {}

    public record OtpRevokeResponse(
            @JsonProperty("ok") boolean ok,
            @JsonProperty("revoked") boolean revoked
    ) implements Serializable {
        public static OtpRevokeResponse success() {
            return new OtpRevokeResponse(true, true);
        }
    }

    public record OtpTestPingRequest(
            @JsonProperty("channel") String channel
    ) implements Serializable {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record OtpTestPingResponse(
            @JsonProperty("ok") boolean ok,
            @JsonProperty("telegramSent") boolean telegramSent,
            @JsonProperty("discordSent") boolean discordSent,
            @JsonProperty("timestamp") String timestamp,
            @JsonProperty("error") String error
    ) implements Serializable {
        public static OtpTestPingResponse of(boolean telegramSent, boolean discordSent, String timestamp) {
            return new OtpTestPingResponse(true, telegramSent, discordSent, timestamp, null);
        }
        public static OtpTestPingResponse error(String message, String timestamp) {
            return new OtpTestPingResponse(false, false, false, timestamp, message);
        }
    }
}
