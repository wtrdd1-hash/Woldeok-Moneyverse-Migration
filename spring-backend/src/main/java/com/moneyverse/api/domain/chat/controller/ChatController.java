package com.moneyverse.api.domain.chat.controller;

import com.moneyverse.api.domain.chat.dto.ChatDtos.*;
import com.moneyverse.api.domain.chat.service.ChatService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.messaging.MessageContract;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@Tag(name="Direct Chat & Messages")
@RestController
@RequestMapping({"/api/chat","/api/v1/chat"})
public class ChatController {
    private final ChatService chatService;
    private final MemberApiGuard guard;
    public ChatController(ChatService chatService,MemberApiGuard guard) {
        this.chatService=chatService;this.guard=guard;
    }
    @GetMapping("/conversations")
    public ResponseEntity<ConversationListResponse> listConversations(HttpServletRequest request,
            @RequestParam(value="limit",defaultValue="50") int limit) {
        return ResponseEntity.ok(chatService.listConversations(guard.actor(request),limit));
    }
    @GetMapping("/unread-count")
    public ResponseEntity<ChatUnreadResponse> unreadCount(HttpServletRequest request) {
        return ResponseEntity.ok(new ChatUnreadResponse(true,chatService.totalUnreadCount(guard.actor(request))));
    }
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<MessageListResponse> listMessages(HttpServletRequest request,@PathVariable("id") UUID id,
            @RequestParam(value="limit",defaultValue="50") int limit) {
        return ResponseEntity.ok(chatService.listMessages(guard.actor(request),id,limit));
    }
    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<SendMessageResponse> sendMessage(HttpServletRequest request,@PathVariable("id") UUID id,
            @RequestBody SendMessageRequest body) {
        UUID actor=guard.verifiedMutationActor(request);
        MessageContract.matchingKey(body.idempotencyKey(),request.getHeader("Idempotency-Key"));
        return ResponseEntity.ok(chatService.sendMessage(actor,id,body));
    }
}
