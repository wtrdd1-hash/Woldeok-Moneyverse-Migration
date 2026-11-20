package com.moneyverse.api.domain.support.controller;

import com.moneyverse.api.domain.support.dto.SupportDtos.*;
import com.moneyverse.api.domain.support.service.SupportService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.messaging.MessageContract;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@Tag(name="Customer Support")
@RestController
@RequestMapping({"/api/support","/api/v1/support"})
public class SupportController {
    private final SupportService supportService;
    private final MemberApiGuard guard;
    public SupportController(SupportService supportService,MemberApiGuard guard) {
        this.supportService=supportService;this.guard=guard;
    }
    @GetMapping("/threads")
    public ResponseEntity<ThreadListResponse> listThreads(HttpServletRequest request,
            @RequestParam(value="status",required=false) String status) {
        return ResponseEntity.ok(supportService.listThreads(guard.actor(request),status));
    }
    @GetMapping("/threads/summary")
    public ResponseEntity<ThreadSummaryResponse> summary(HttpServletRequest request) {
        return ResponseEntity.ok(supportService.summary(guard.actor(request)));
    }
    @PostMapping("/threads")
    public ResponseEntity<ThreadCreateResponse> createThread(HttpServletRequest request,@RequestBody NewThreadRequest body) {
        UUID actor=guard.verifiedMutationActor(request);
        MessageContract.matchingKey(body.idempotencyKey(),request.getHeader("Idempotency-Key"));
        return ResponseEntity.ok(supportService.createThread(actor,body));
    }
    @GetMapping("/threads/{id}/messages")
    public ResponseEntity<MessageListResponse> listMessages(HttpServletRequest request,@PathVariable("id") UUID id) {
        return ResponseEntity.ok(supportService.listMessages(guard.actor(request),id));
    }
    @PostMapping("/threads/{id}/messages")
    public ResponseEntity<MessageCreateResponse> addMessage(HttpServletRequest request,@PathVariable("id") UUID id,
            @RequestBody NewMessageRequest body) {
        UUID actor=guard.verifiedMutationActor(request);
        MessageContract.matchingKey(body.idempotencyKey(),request.getHeader("Idempotency-Key"));
        return ResponseEntity.ok(supportService.addMessage(actor,id,body));
    }
}
