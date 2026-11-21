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
        UUID actor=guard.actor(request);
        return ownerRead(actor,chatService.listConversations(actor,limit));
    }
    @GetMapping("/unread-count")
    public ResponseEntity<ChatUnreadResponse> unreadCount(HttpServletRequest request) {
        UUID actor=guard.actor(request);
        return ownerRead(actor,new ChatUnreadResponse(true,chatService.totalUnreadCount(actor)));
    }
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<MessageListResponse> listMessages(HttpServletRequest request,@PathVariable("id") UUID id,
            @RequestParam(value="limit",defaultValue="50") int limit) {
        UUID actor=guard.actor(request);
        return ownerRead(actor,chatService.listMessages(actor,id,limit));
    }
    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<SendMessageResponse> sendMessage(HttpServletRequest request,@PathVariable("id") UUID id,
            @RequestBody SendMessageRequest body) {
        UUID actor=guard.verifiedMutationActor(request);
        MessageContract.matchingKey(body.idempotencyKey(),request.getHeader("Idempotency-Key"));
        return ResponseEntity.ok(chatService.sendMessage(actor,id,body));
    }
    // Bind ownerless read DTOs to the exact verified actor, including across cookie races.
    private static <T> ResponseEntity<T> ownerRead(UUID actor,T body) {
        return ResponseEntity.ok().header("X-MV-Owner",actor.toString())
            .header("Cache-Control","private, no-store").header("Vary","Cookie").body(body);
    }
}
