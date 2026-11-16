package com.moneyverse.api.domain.discord.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/integrations/discord",
        "/api/integrations/discord",
        "/integrations/discord"
})
public class DiscordController {

    @GetMapping("/guilds/status")
    public ResponseEntity<Map<String, Object>> getGuildStatus() {
        return ResponseEntity.ok(Map.of(
                "connected", true,
                "botUsername", "월덕봇#7601",
                "guildCount", 2,
                "primaryGuildId", "893480506799292527",
                "primaryGuildName", "IT프린",
                "syncedRolesCount", 22,
                "syncedChannelsCount", 52,
                "gatewayLatencyMs", 34
        ));
    }

    @PostMapping("/interactions")
    public ResponseEntity<Map<String, Object>> handleInteraction(@RequestBody(required = false) Map<String, Object> payload) {
        // Discord Interaction PING (type: 1) -> PONG (type: 1)
        if (payload != null && Objects.equals(payload.get("type"), 1)) {
            return ResponseEntity.ok(Map.of("type", 1));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("type", 4); // ChannelMessageWithSource
        response.put("data", Map.of("content", "월덕 머니버스 서비스가 정상 응답했습니다."));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/announcements")
    public ResponseEntity<Map<String, Object>> dispatchAnnouncement(@RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("dispatchedAt", new Date().toInstant().toString());
        res.put("targetChannelId", body != null ? body.get("channelId") : "1023470382965080084");
        return ResponseEntity.ok(res);
    }
}
