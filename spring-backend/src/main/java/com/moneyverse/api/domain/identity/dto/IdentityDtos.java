package com.moneyverse.api.domain.identity.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.Map;

public class IdentityDtos {

    public static class UserProfile {
        private String id;
        private String displayName;
        private String email;
        private String imageUrl;
        private String jobType;
        private Integer jobLevel;
        private String workCompletions;
        private String visibility;
        private String featuredTitle;
        private String joinedAt;

        public UserProfile() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getJobType() { return jobType; }
        public void setJobType(String jobType) { this.jobType = jobType; }
        public Integer getJobLevel() { return jobLevel; }
        public void setJobLevel(Integer jobLevel) { this.jobLevel = jobLevel; }
        public String getWorkCompletions() { return workCompletions; }
        public void setWorkCompletions(String workCompletions) { this.workCompletions = workCompletions; }
        public String getVisibility() { return visibility; }
        public void setVisibility(String visibility) { this.visibility = visibility; }
        public String getFeaturedTitle() { return featuredTitle; }
        public void setFeaturedTitle(String featuredTitle) { this.featuredTitle = featuredTitle; }
        public String getJoinedAt() { return joinedAt; }
        public void setJoinedAt(String joinedAt) { this.joinedAt = joinedAt; }
    }

    public static class ChannelOtpRequest {
        @NotBlank(message = "actionName is required")
        @JsonAlias({"actionName", "action_name", "action"})
        private String actionName;

        public ChannelOtpRequest() {}

        public String getActionName() { return actionName; }
        public void setActionName(String actionName) { this.actionName = actionName; }
    }

    public static class ChannelOtpVerifyRequest {
        @NotBlank(message = "otpCode is required")
        @JsonAlias({"otpCode", "otp_code", "token", "otpToken"})
        private String otpCode;

        public ChannelOtpVerifyRequest() {}

        public String getOtpCode() { return otpCode; }
        public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
    }
}
