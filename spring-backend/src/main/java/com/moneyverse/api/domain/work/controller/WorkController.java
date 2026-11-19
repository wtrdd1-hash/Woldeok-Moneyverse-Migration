package com.moneyverse.api.domain.work.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.work.dto.WorkDtos.*;
import com.moneyverse.api.domain.work.service.WorkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@Tag(name = "Work & Careers", description = "Verified owner job reads and idempotent task receipts")
@RestController
@RequestMapping({"/api/work", "/api/v1/work"})
public class WorkController {
    private final WorkService workService;
    private final MemberApiGuard memberApiGuard;

    public WorkController(WorkService workService, MemberApiGuard memberApiGuard) {
        this.workService = workService;
        this.memberApiGuard = memberApiGuard;
    }

    @GetMapping({"", "/", "/dashboard"})
    @Operation(summary = "Session owner-only daily/weekly limits and assignments")
    public ResponseEntity<WorkDashboardResponse> getDashboard(HttpServletRequest request) {
        return ResponseEntity.ok(workService.getDashboard(memberApiGuard.actor(request).toString()));
    }

    @GetMapping("/tasks")
    @Operation(summary = "Verified member's task board")
    public ResponseEntity<WorkTaskBoardResponse> getTaskBoard(HttpServletRequest request) {
        return ResponseEntity.ok(workService.getTaskBoard(memberApiGuard.actor(request).toString()));
    }

    @GetMapping("/assignments")
    @Operation(summary = "Verified member's current assignments")
    public ResponseEntity<WorkAssignmentsResponse> getAssignments(HttpServletRequest request) {
        return ResponseEntity.ok(workService.getMyAssignments(memberApiGuard.actor(request).toString()));
    }

    @PostMapping("/assignments")
    @Operation(summary = "Task acceptance requires session, CSRF, idempotency key, and DB receipt")
    public ResponseEntity<WorkAssignResponse> assignTask(HttpServletRequest servletRequest,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody(required = false) WorkAssignRequest request) {
        UUID actor = memberApiGuard.verifiedMutationActor(servletRequest);
        UUID key = memberApiGuard.idempotencyKey(idempotencyKey);
        if (request == null || request.taskId() == null || request.taskId().isBlank()) {
            return ResponseEntity.badRequest().body(WorkAssignResponse.fail("TASK_ID_REQUIRED"));
        }
        WorkAssignResponse response = workService.assignTask(actor.toString(), request.taskId(), key);
        return response.success() ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/completions")
    @Operation(summary = "Work completion requires verified owner, CSRF, and canonical idempotent receipt")
    public ResponseEntity<WorkCompleteResponse> completeTask(HttpServletRequest servletRequest,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody(required = false) WorkCompleteRequest request) {
        UUID actor = memberApiGuard.verifiedMutationActor(servletRequest);
        UUID key = memberApiGuard.idempotencyKey(idempotencyKey);
        if (request == null || request.assignmentId() == null || request.assignmentId().isBlank()) {
            return ResponseEntity.badRequest().body(WorkCompleteResponse.fail("ASSIGNMENT_ID_REQUIRED"));
        }
        WorkCompleteResponse response = workService.completeTask(actor.toString(), request.assignmentId(), key);
        return response.success() ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }
}
