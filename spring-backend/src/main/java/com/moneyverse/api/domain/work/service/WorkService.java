package com.moneyverse.api.domain.work.service;

import com.moneyverse.api.domain.work.dto.WorkDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class WorkService {
    private static final Logger log = LoggerFactory.getLogger(WorkService.class);
    private final JdbcClient jdbcClient;

    public WorkService(JdbcClient jdbcClient) { this.jdbcClient = jdbcClient; }

    private UUID actor(String userId) {
        try { return UUID.fromString(userId); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED"); }
    }

    private ResponseStatusException unavailable(String source) {
        log.warn("Work canonical source unavailable: {}", source);
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "WORK_SOURCE_UNAVAILABLE");
    }

    public WorkDashboardResponse getDashboard(String userId) {
        UUID owner = actor(userId);
        try {
            List<WorkTask> tasks = getTaskBoard(userId).tasks();
            List<WorkAssignment> assignments = getMyAssignments(userId).assignments();
            WorkSummary summary = jdbcClient.sql("SELECT daily_paid::text, daily_cap::text, weekly_paid::text, weekly_cap::text, active_assignments::text, game_day_key::text, game_week_key::text, day_ends_at::text, week_ends_at::text FROM public.work_my_dashboard_v2(?::uuid)")
                    .param(owner)
                    .query((rs, n) -> new WorkSummary(
                            rs.getString("daily_paid"), rs.getString("daily_cap"),
                            rs.getString("weekly_paid"), rs.getString("weekly_cap"),
                            rs.getString("active_assignments"), rs.getString("game_day_key"),
                            rs.getString("game_week_key"), rs.getString("day_ends_at"),
                            rs.getString("week_ends_at")))
                    .optional().orElseThrow(() -> unavailable("dashboard_empty"));
            return new WorkDashboardResponse(true, summary, tasks, assignments);
        } catch (Exception e) {
            throw unavailable("dashboard");
        }
    }

    public WorkTaskBoardResponse getTaskBoard(String userId) {
        UUID owner = actor(userId);
        try {
            List<WorkTask> tasks = jdbcClient.sql("SELECT task_id::text, code, name, description, job_type::text, difficulty, base_reward::text, base_experience::text, minimum_duration_seconds, daily_limit, taken_today, reward_preview::text, recommended FROM public.work_task_board(?::uuid)")
                    .param(owner)
                    .query((rs, n) -> new WorkTask(
                            rs.getString("task_id"), rs.getString("code"), rs.getString("name"),
                            rs.getString("description"), rs.getString("job_type"), rs.getInt("difficulty"),
                            rs.getString("base_reward"), rs.getString("base_experience"),
                            rs.getInt("minimum_duration_seconds"), rs.getInt("daily_limit"),
                            rs.getInt("taken_today"), rs.getString("reward_preview"),
                            null, // no experience_preview field in authoritative PostgreSQL function
                            rs.getBoolean("recommended")))
                    .list();
            return new WorkTaskBoardResponse(true, tasks);
        } catch (Exception e) {
            throw unavailable("task_board");
        }
    }

    public WorkAssignmentsResponse getMyAssignments(String userId) {
        UUID owner = actor(userId);
        try {
            List<WorkAssignment> rows = jdbcClient.sql("SELECT assignment_id::text, task_id::text, code, name, job_type::text, status::text, assigned_at::text, expires_at::text, reward_amount::text, experience_amount::text FROM public.work_my_assignments(?::uuid)")
                    .param(owner)
                    .query((rs, n) -> new WorkAssignment(
                            rs.getString("assignment_id"), rs.getString("task_id"), rs.getString("code"),
                            rs.getString("name"), rs.getString("job_type"), rs.getString("status"),
                            rs.getString("assigned_at"), rs.getString("expires_at"),
                            rs.getString("reward_amount"), rs.getString("experience_amount")))
                    .list();
            return new WorkAssignmentsResponse(true, rows);
        } catch (Exception e) {
            throw unavailable("assignments");
        }
    }

    /** Legacy no-idempotency call cannot create receipts. */
    public WorkAssignResponse assignTask(String userId, String taskId) {
        return WorkAssignResponse.fail("IDEMPOTENCY_KEY_REQUIRED");
    }

    public WorkAssignResponse assignTask(String userId, String taskId, UUID key) {
        if (key == null) return WorkAssignResponse.fail("IDEMPOTENCY_KEY_REQUIRED");
        UUID owner = actor(userId);
        try {
            UUID task = UUID.fromString(taskId);
            return jdbcClient.sql("SELECT assignment_id::text FROM public.work_assign_task(?::uuid, ?::uuid, ?::uuid)")
                    .param(key).param(owner).param(task)
                    .query((rs, n) -> WorkAssignResponse.ok(rs.getString("assignment_id")))
                    .optional().orElseGet(() -> WorkAssignResponse.fail("ASSIGNMENT_RECEIPT_MISSING"));
        } catch (Exception e) {
            log.warn("Work task acceptance had no authoritative receipt");
            return WorkAssignResponse.fail("ASSIGNMENT_SOURCE_UNAVAILABLE");
        }
    }

    public WorkCompleteResponse completeTask(String userId, String assignmentId) {
        return WorkCompleteResponse.fail("IDEMPOTENCY_KEY_REQUIRED");
    }

    public WorkCompleteResponse completeTask(String userId, String assignmentId, UUID key) {
        if (key == null) return WorkCompleteResponse.fail("IDEMPOTENCY_KEY_REQUIRED");
        UUID owner = actor(userId);
        try {
            UUID assignment = UUID.fromString(assignmentId);
            String taskId = jdbcClient.sql("SELECT task_id::text FROM public.work_my_assignments(?::uuid) WHERE assignment_id = ?::uuid")
                    .param(owner).param(assignment).query(String.class).optional().orElse(null);
            if (taskId == null) return WorkCompleteResponse.fail("ASSIGNMENT_NOT_OWNED_OR_MISSING");
            UUID task = UUID.fromString(taskId);
            return jdbcClient.sql("SELECT reward_amount::text, experience_gained::text, transaction_id::text FROM public.work_complete_task_v2(?::uuid, ?::uuid, ?::uuid)")
                    .param(owner).param(task).param(key)
                    .query((rs, n) -> {
                        String receipt = rs.getString("transaction_id");
                        return receipt == null ? WorkCompleteResponse.fail("WORK_LEDGER_RECEIPT_MISSING")
                            : WorkCompleteResponse.ok(rs.getString("reward_amount"), rs.getString("experience_gained"), receipt);
                    })
                    .optional().orElseGet(() -> WorkCompleteResponse.fail("WORK_LEDGER_RECEIPT_MISSING"));
        } catch (Exception e) {
            log.warn("Work completion lacked authoritative ledger receipt");
            return WorkCompleteResponse.fail("WORK_LEDGER_UNAVAILABLE");
        }
    }
}
