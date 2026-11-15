package com.moneyverse.api.domain.work.controller;

import com.moneyverse.api.domain.work.dto.WorkDtos.*;
import com.moneyverse.api.domain.work.service.WorkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Work & Careers", description = "구직, 과업 수행, 급여 정산 및 일일 쿼터 API")
@RestController
@RequestMapping({"/api/work", "/api/v1/work"})
public class WorkController {

    private final WorkService workService;

    public WorkController(WorkService workService) {
        this.workService = workService;
    }

    private String resolveUserId(String xUserId, String xActorUserId) {
        if (xUserId != null && !xUserId.isBlank()) return xUserId.trim();
        if (xActorUserId != null && !xActorUserId.isBlank()) return xActorUserId.trim();
        return "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
    }

    @GetMapping({"", "/", "/dashboard"})
    @Operation(summary = "내 직업 및 일일/주간 과업 상한, 진행 중인 과업 대시보드 조회")
    public ResponseEntity<WorkDashboardResponse> getDashboard(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        String userId = resolveUserId(xUserId, xActorUserId);
        return ResponseEntity.ok(workService.getDashboard(userId));
    }

    @GetMapping("/tasks")
    @Operation(summary = "현재 수락 가능한 과업 게시판 목록 조회")
    public ResponseEntity<WorkTaskBoardResponse> getTaskBoard(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        String userId = resolveUserId(xUserId, xActorUserId);
        return ResponseEntity.ok(workService.getTaskBoard(userId));
    }

    @GetMapping("/assignments")
    @Operation(summary = "내가 현재 진행 중인 과업 목록 조회")
    public ResponseEntity<WorkAssignmentsResponse> getAssignments(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        String userId = resolveUserId(xUserId, xActorUserId);
        return ResponseEntity.ok(workService.getMyAssignments(userId));
    }

    @PostMapping("/assignments")
    @Operation(summary = "과업 수락 및 할당 생성")
    public ResponseEntity<WorkAssignResponse> assignTask(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId,
            @RequestBody WorkAssignRequest request
    ) {
        String userId = resolveUserId(xUserId, xActorUserId);
        if (request == null || request.taskId() == null || request.taskId().isBlank()) {
            return ResponseEntity.badRequest().body(WorkAssignResponse.fail("task_id is required"));
        }
        WorkAssignResponse response = workService.assignTask(userId, request.taskId());
        return response.success() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/completions")
    @Operation(summary = "과업 완료 보고 및 급여/경험치 정산")
    public ResponseEntity<WorkCompleteResponse> completeTask(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId,
            @RequestBody WorkCompleteRequest request
    ) {
        String userId = resolveUserId(xUserId, xActorUserId);
        if (request == null || request.assignmentId() == null || request.assignmentId().isBlank()) {
            return ResponseEntity.badRequest().body(WorkCompleteResponse.fail("assignment_id is required"));
        }
        WorkCompleteResponse response = workService.completeTask(userId, request.assignmentId());
        return response.success() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }
}
