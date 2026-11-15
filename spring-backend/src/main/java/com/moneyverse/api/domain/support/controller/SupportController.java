package com.moneyverse.api.domain.support.controller;

import com.moneyverse.api.domain.support.dto.SupportDtos.*;
import com.moneyverse.api.domain.support.service.SupportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Customer Support", description = "고객 지원 문의 스레드 조회, 접수 및 메시지 이력 API")
@RestController
@RequestMapping({"/api/support", "/api/v1/support"})
public class SupportController {

    private final SupportService supportService;

    public SupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    private UUID resolveUserUuid(String xUserId, String xActorUserId) {
        String raw = (xUserId != null && !xUserId.isBlank()) ? xUserId.trim()
                : (xActorUserId != null && !xActorUserId.isBlank()) ? xActorUserId.trim()
                : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            return UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20");
        }
    }

    @GetMapping("/threads")
    @Operation(summary = "내 1:1 고객지원 문의 목록 조회")
    public ResponseEntity<ThreadListResponse> listThreads(
            @RequestParam(value = "status", required = false) String status,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(supportService.listThreads(userId, status));
    }

    @GetMapping("/threads/summary")
    @Operation(summary = "내 문의 건수 상태별 요약 조회")
    public ResponseEntity<ThreadSummaryResponse> summary(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(supportService.summary(userId));
    }

    @PostMapping("/threads")
    @Operation(summary = "새로운 1:1 고객지원 문의 등록")
    public ResponseEntity<ThreadCreateResponse> createThread(
            @RequestBody NewThreadRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(supportService.createThread(userId, req));
    }

    @GetMapping("/threads/{id}/messages")
    @Operation(summary = "특정 문의의 대화 메시지 이력 조회")
    public ResponseEntity<MessageListResponse> listMessages(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(supportService.listMessages(userId, id));
    }
}
