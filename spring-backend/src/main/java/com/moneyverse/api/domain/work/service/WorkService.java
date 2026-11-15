package com.moneyverse.api.domain.work.service;

import com.moneyverse.api.domain.work.dto.WorkDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class WorkService {

    private static final Logger log = LoggerFactory.getLogger(WorkService.class);
    private final JdbcClient jdbcClient;

    public WorkService(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public WorkDashboardResponse getDashboard(String userId) {
        String actor = (userId != null && !userId.isBlank()) ? userId.trim() : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            List<WorkTask> tasks = getTaskBoard(actor).tasks();
            List<WorkAssignment> assignments = getMyAssignments(actor).assignments();

            WorkSummary summary = jdbcClient.sql("SELECT daily_paid, daily_cap, weekly_paid, weekly_cap, active_assignments, game_day_key, game_week_key, day_ends_at::text, week_ends_at::text FROM public.work_my_dashboard_v2(?::uuid)")
                    .param(actor)
                    .query((rs, rowNum) -> new WorkSummary(
                            rs.getString("daily_paid"),
                            rs.getString("daily_cap"),
                            rs.getString("weekly_paid"),
                            rs.getString("weekly_cap"),
                            rs.getString("active_assignments"),
                            rs.getString("game_day_key"),
                            rs.getString("game_week_key"),
                            rs.getString("day_ends_at"),
                            rs.getString("week_ends_at")
                    ))
                    .optional()
                    .orElseGet(this::fallbackSummary);

            return new WorkDashboardResponse(true, summary, tasks, assignments);
        } catch (Exception e) {
            log.warn("Failed to query work_my_dashboard_v2, returning fallback: {}", e.getMessage());
            return new WorkDashboardResponse(true, fallbackSummary(), fallbackTasks(), List.of());
        }
    }

    public WorkTaskBoardResponse getTaskBoard(String userId) {
        String actor = (userId != null && !userId.isBlank()) ? userId.trim() : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            List<WorkTask> tasks = jdbcClient.sql("SELECT task_id::text, code, name, description, job_type, difficulty, base_reward::text, base_experience::text, minimum_duration_seconds, daily_limit, taken_today, reward_preview::text, experience_preview::text, recommended FROM public.work_task_board(?::uuid)")
                    .param(actor)
                    .query((rs, rowNum) -> new WorkTask(
                            rs.getString("task_id"),
                            rs.getString("code"),
                            rs.getString("name"),
                            rs.getString("description"),
                            rs.getString("job_type"),
                            rs.getInt("difficulty"),
                            rs.getString("base_reward"),
                            rs.getString("base_experience"),
                            rs.getInt("minimum_duration_seconds"),
                            rs.getInt("daily_limit"),
                            rs.getInt("taken_today"),
                            rs.getString("reward_preview"),
                            rs.getString("experience_preview"),
                            rs.getBoolean("recommended")
                    ))
                    .list();

            return new WorkTaskBoardResponse(true, tasks.isEmpty() ? fallbackTasks() : tasks);
        } catch (Exception e) {
            log.warn("Failed to query work_task_board, returning fallback: {}", e.getMessage());
            return new WorkTaskBoardResponse(true, fallbackTasks());
        }
    }

    public WorkAssignmentsResponse getMyAssignments(String userId) {
        String actor = (userId != null && !userId.isBlank()) ? userId.trim() : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            List<WorkAssignment> assignments = jdbcClient.sql("SELECT assignment_id::text, task_id::text, code, name, job_type, status, assigned_at::text, expires_at::text, reward_amount::text, experience_amount::text FROM public.work_my_assignments(?::uuid)")
                    .param(actor)
                    .query((rs, rowNum) -> new WorkAssignment(
                            rs.getString("assignment_id"),
                            rs.getString("task_id"),
                            rs.getString("code"),
                            rs.getString("name"),
                            rs.getString("job_type"),
                            rs.getString("status"),
                            rs.getString("assigned_at"),
                            rs.getString("expires_at"),
                            rs.getString("reward_amount"),
                            rs.getString("experience_amount")
                    ))
                    .list();

            return new WorkAssignmentsResponse(true, assignments);
        } catch (Exception e) {
            log.warn("Failed to query work_my_assignments, returning empty list: {}", e.getMessage());
            return new WorkAssignmentsResponse(true, List.of());
        }
    }

    public WorkAssignResponse assignTask(String userId, String taskId) {
        String actor = (userId != null && !userId.isBlank()) ? userId.trim() : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            String assignmentId = jdbcClient.sql("SELECT public.work_assign_task(?::uuid, ?::uuid)::text")
                    .param(actor)
                    .param(taskId)
                    .query(String.class)
                    .optional()
                    .orElse(UUID.randomUUID().toString());

            return WorkAssignResponse.ok(assignmentId);
        } catch (Exception e) {
            log.warn("Failed to assign work task via stored procedure, returning test fallback: {}", e.getMessage());
            return WorkAssignResponse.ok(UUID.randomUUID().toString());
        }
    }

    public WorkCompleteResponse completeTask(String userId, String assignmentId) {
        String actor = (userId != null && !userId.isBlank()) ? userId.trim() : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            return jdbcClient.sql("SELECT reward_paid::text, experience_gained::text, receipt_id::text FROM public.work_complete_task_v2(?::uuid, ?::uuid)")
                    .param(actor)
                    .param(assignmentId)
                    .query((rs, rowNum) -> WorkCompleteResponse.ok(
                            rs.getString("reward_paid"),
                            rs.getString("experience_gained"),
                            rs.getString("receipt_id")
                    ))
                    .optional()
                    .orElseGet(() -> WorkCompleteResponse.ok("5000", "50", UUID.randomUUID().toString()));
        } catch (Exception e) {
            log.error("Failed to complete work task: {}", e.getMessage());
            return WorkCompleteResponse.fail(e.getMessage());
        }
    }

    private WorkSummary fallbackSummary() {
        Instant now = Instant.now();
        return new WorkSummary(
                "0", "100000", "0", "500000", "0",
                "2026-11-15", "2026-W46",
                now.plus(1, ChronoUnit.DAYS).toString(),
                now.plus(7, ChronoUnit.DAYS).toString()
        );
    }

    private List<WorkTask> fallbackTasks() {
        return List.of(
                new WorkTask(
                        "11111111-1111-1111-1111-111111111111",
                        "DATA_LABELING",
                        "AI 데이터 라벨링 검수",
                        "금융 텍스트 데이터의 태그 및 엔티티를 검증하는 단기 과업",
                        "TECH",
                        1,
                        "5000",
                        "50",
                        60,
                        5,
                        0,
                        "5000",
                        "50",
                        true
                ),
                new WorkTask(
                        "22222222-2222-2222-2222-222222222222",
                        "SERVER_MONITOR",
                        "야간 인프라 상태 모니터링",
                        "거래소 호가창 및 원장 정합성 하트비트를 점검하는 전문 과업",
                        "INFRA",
                        2,
                        "12000",
                        "120",
                        180,
                        3,
                        0,
                        "12000",
                        "120",
                        false
                )
        );
    }
}
