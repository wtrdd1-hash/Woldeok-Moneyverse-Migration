package com.moneyverse.api.domain.work.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.util.List;

public final class WorkDtos {

    private WorkDtos() {}

    public record WorkSummary(
            @JsonProperty("daily_paid") String dailyPaid,
            @JsonProperty("daily_cap") String dailyCap,
            @JsonProperty("weekly_paid") String weeklyPaid,
            @JsonProperty("weekly_cap") String weeklyCap,
            @JsonProperty("active_assignments") String activeAssignments,
            @JsonProperty("game_day_key") String gameDayKey,
            @JsonProperty("game_week_key") String gameWeekKey,
            @JsonProperty("day_ends_at") String dayEndsAt,
            @JsonProperty("week_ends_at") String weekEndsAt
    ) implements Serializable {}

    public record WorkDashboardResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("summary") WorkSummary summary,
            @JsonProperty("tasks") List<WorkTask> tasks,
            @JsonProperty("assignments") List<WorkAssignment> assignments
    ) implements Serializable {}

    public record WorkTask(
            @JsonProperty("task_id") String taskId,
            @JsonProperty("code") String code,
            @JsonProperty("name") String name,
            @JsonProperty("description") String description,
            @JsonProperty("job_type") String jobType,
            @JsonProperty("difficulty") int difficulty,
            @JsonProperty("base_reward") String baseReward,
            @JsonProperty("base_experience") String baseExperience,
            @JsonProperty("minimum_duration_seconds") int minimumDurationSeconds,
            @JsonProperty("daily_limit") int dailyLimit,
            @JsonProperty("taken_today") int takenToday,
            @JsonProperty("reward_preview") String rewardPreview,
            @JsonProperty("experience_preview") String experiencePreview,
            @JsonProperty("recommended") boolean recommended
    ) implements Serializable {}

    public record WorkTaskBoardResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("tasks") List<WorkTask> tasks
    ) implements Serializable {}

    public record WorkAssignment(
            @JsonProperty("assignment_id") String assignmentId,
            @JsonProperty("task_id") String taskId,
            @JsonProperty("code") String code,
            @JsonProperty("name") String name,
            @JsonProperty("job_type") String jobType,
            @JsonProperty("status") String status,
            @JsonProperty("assigned_at") String assignedAt,
            @JsonProperty("expires_at") String expiresAt,
            @JsonProperty("reward_amount") String rewardAmount,
            @JsonProperty("experience_amount") String experienceAmount
    ) implements Serializable {}

    public record WorkAssignmentsResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("assignments") List<WorkAssignment> assignments
    ) implements Serializable {}

    public record WorkAssignRequest(
            @JsonProperty("task_id") String taskId
    ) implements Serializable {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record WorkAssignResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("assignment_id") String assignmentId,
            @JsonProperty("message") String message,
            @JsonProperty("error") String error
    ) implements Serializable {
        public static WorkAssignResponse ok(String assignmentId) {
            return new WorkAssignResponse(true, assignmentId, "과업이 성공적으로 할당되었습니다.", null);
        }
        public static WorkAssignResponse fail(String error) {
            return new WorkAssignResponse(false, null, null, error);
        }
    }

    public record WorkCompleteRequest(
            @JsonProperty("assignment_id") String assignmentId
    ) implements Serializable {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record WorkCompleteResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("reward_paid") String rewardPaid,
            @JsonProperty("experience_gained") String experienceGained,
            @JsonProperty("receipt_id") String receiptId,
            @JsonProperty("message") String message,
            @JsonProperty("error") String error
    ) implements Serializable {
        public static WorkCompleteResponse ok(String rewardPaid, String experienceGained, String receiptId) {
            return new WorkCompleteResponse(true, rewardPaid, experienceGained, receiptId, "과업 완료 및 급여 지급이 완료되었습니다.", null);
        }
        public static WorkCompleteResponse fail(String error) {
            return new WorkCompleteResponse(false, null, null, null, null, error);
        }
    }
}
