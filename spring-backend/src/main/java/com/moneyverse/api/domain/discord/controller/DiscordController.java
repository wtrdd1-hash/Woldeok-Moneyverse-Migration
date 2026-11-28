package com.moneyverse.api.domain.discord.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/integrations/discord",
        "/api/integrations/discord",
        "/integrations/discord"
})
public class DiscordController {
    private static final com.fasterxml.jackson.databind.ObjectMapper JSON = new com.fasterxml.jackson.databind.ObjectMapper();
    private final DiscordInteractionVerifier verifier;

    @org.springframework.beans.factory.annotation.Autowired
    public DiscordController() {
        this(new DiscordInteractionVerifier(System.getenv("DISCORD_PUBLIC_KEY")));
    }

    public DiscordController(DiscordInteractionVerifier verifier) {
        this.verifier = verifier;
    }


    @GetMapping("/guilds/status")
    public ResponseEntity<Map<String, Object>> getGuildStatus() {
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "DISCORD_GUILD_STATUS_SOURCE_UNAVAILABLE");
    }

    @PostMapping("/interactions")
    public ResponseEntity<Map<String, Object>> handleInteraction(
            @RequestBody(required = false) String rawBody,
            @RequestHeader(value = "X-Signature-Ed25519", required = false) String signature,
            @RequestHeader(value = "X-Signature-Timestamp", required = false) String timestamp) {
        // AGENTS.md: verify the Ed25519 signature over timestamp + exact bytes before parsing
        // anything (security review 2026-11-25: nothing was verified). No key = refuse all.
        if (!verifier.verify(signature, timestamp, rawBody)) {
            return ResponseEntity.status(401).body(Map.of("error", "invalid request signature"));
        }
        Map<String, Object> payload;
        try {
            payload = JSON.readValue(rawBody, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "invalid interaction body"));
        }
        // Discord Interaction PING (type: 1) -> PONG (type: 1)
        if (Objects.equals(payload.get("type"), 1)) {
            return ResponseEntity.ok(Map.of("type", 1));
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("type", 4); // ChannelMessageWithSource
        response.put("data", Map.of("content", "월덕 머니버스 서비스가 정상 응답했습니다."));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/announcements")
    public ResponseEntity<Map<String, Object>> dispatchAnnouncement(@RequestBody(required = false) Map<String, Object> body) {
        // Security review 2026-11-25: this answered success with a dispatch time while sending
        // nothing, to anyone. No announcement is sent from this route; say so.
        return ResponseEntity.status(503).body(Map.of("success", false, "code", "DISCORD_ANNOUNCEMENT_NOT_AVAILABLE",
                "message", "Announcements are not sent from this endpoint"));
    }
}
