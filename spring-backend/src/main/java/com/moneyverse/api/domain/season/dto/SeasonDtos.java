package com.moneyverse.api.domain.season.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public class SeasonDtos {

    public static class SeasonInfo {
        private String id;
        private String title;
        private Integer seasonNumber;
        private String status;
        private Instant startsAt;
        private Instant endsAt;

        public SeasonInfo() {}

        public SeasonInfo(String id, String title, Integer seasonNumber, String status, Instant startsAt, Instant endsAt) {
            this.id = id;
            this.title = title;
            this.seasonNumber = seasonNumber;
            this.status = status;
            this.startsAt = startsAt;
            this.endsAt = endsAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Integer getSeasonNumber() { return seasonNumber; }
        public void setSeasonNumber(Integer seasonNumber) { this.seasonNumber = seasonNumber; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Instant getStartsAt() { return startsAt; }
        public void setStartsAt(Instant startsAt) { this.startsAt = startsAt; }
        public Instant getEndsAt() { return endsAt; }
        public void setEndsAt(Instant endsAt) { this.endsAt = endsAt; }
    }

    public static class ClaimRewardRequest {
        @NotBlank(message = "seasonId is required")
        @JsonAlias({"seasonId", "season_id"})
        private String seasonId;

        @JsonAlias({"idempotencyKey", "idempotency_key", "requestKey"})
        private String idempotencyKey;

        public ClaimRewardRequest() {}

        public String getSeasonId() { return seasonId; }
        public void setSeasonId(String seasonId) { this.seasonId = seasonId; }
        public String getIdempotencyKey() { return idempotencyKey; }
        public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    }
}
