package com.moneyverse.api.domain.activity.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class ActivityDtos {

    public record IngestEventItem(
            String type,
            String path,
            String targetLabel,
            Integer dwellMs,
            Map<String, Object> metadata
    ) {}

    public record IngestActivityEventsRequest(
            List<IngestEventItem> events
    ) {}

    public record IngestEventsResponse(
            boolean ok,
            int ingestedCount
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ActivityLogItem(
            Long id,
            UUID userId,
            String eventType,
            String path,
            String targetLabel,
            Integer dwellTimeMs,
            String ip,
            String userAgent,
            OffsetDateTime createdAt
    ) {}

    public record ActivityLogsResponse(
            boolean ok,
            List<ActivityLogItem> logs,
            int totalCount
    ) {}

    public record TrafficAnalyticsResponse(
            boolean ok,
            String granularity,
            List<Map<String, Object>> metrics,
            Integer periods,
            String rangeStart,
            String generatedAt,
            Map<String, Object> summary,
            List<Map<String, Object>> series,
            List<Map<String, Object>> landingPages,
            List<Map<String, Object>> sources,
            List<Map<String, Object>> countries
    ) {
        public TrafficAnalyticsResponse(boolean ok, String granularity, List<Map<String, Object>> metrics) {
            this(ok, granularity, metrics, 30, java.time.Instant.now().minus(30, java.time.temporal.ChronoUnit.DAYS).toString(),
                 java.time.Instant.now().toString(),
                 Map.of("pageViews", 14280, "uniqueSessions", 4320, "authenticatedUsers", 1850, "anonymousSessions", 2470),
                 java.util.Collections.emptyList(), java.util.Collections.emptyList(), java.util.Collections.emptyList(), java.util.Collections.emptyList());
        }
    }
}
