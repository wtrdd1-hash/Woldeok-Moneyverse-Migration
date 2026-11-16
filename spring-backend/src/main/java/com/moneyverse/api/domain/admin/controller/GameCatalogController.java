package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/admin/games/catalog",
        "/api/admin/games/catalog",
        "/admin/games/catalog"
})
public class GameCatalogController {

    private final UserAuthService userAuthService;

    @Autowired
    public GameCatalogController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    private void verifyAdmin(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        List<String> roles = sessionOpt.get().getRoles();
        boolean hasAdmin = roles != null && roles.stream().anyMatch(r -> "SUPERADMIN".equalsIgnoreCase(r) || "ADMIN".equalsIgnoreCase(r));
        if (!hasAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Admin access required");
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listGames(HttpServletRequest request) {
        verifyAdmin(request);
        List<Map<String, Object>> games = List.of(
                Map.of("id", "game-dice", "name", "하이로우 다이스", "category", "CASINO", "status", "ACTIVE", "rtpPercent", 98.5),
                Map.of("id", "game-slot", "name", "네오 메가 슬롯", "category", "CASINO", "status", "ACTIVE", "rtpPercent", 96.0),
                Map.of("id", "game-pvp-arena", "name", "PVP 콜로세움 아레나", "category", "PVP", "status", "ACTIVE", "entryFeeWld", 10000)
        );
        return ResponseEntity.ok(Map.of("games", games, "count", games.size()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registerGame(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        verifyAdmin(request);
        if (body == null || !body.containsKey("name") || !body.containsKey("category")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name and category are required");
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("id", "game-" + UUID.randomUUID());
        res.put("name", body.get("name"));
        res.put("status", "INACTIVE");
        res.put("registeredAt", new Date().toInstant().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateGameConfig(
            HttpServletRequest request,
            @PathVariable("id") String id,
            @RequestBody(required = false) Map<String, Object> body) {
        verifyAdmin(request);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("id", id);
        res.put("updatedAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleGameStatus(
            HttpServletRequest request,
            @PathVariable("id") String id) {
        verifyAdmin(request);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("id", id);
        res.put("status", "ACTIVE");
        res.put("toggledAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }
}
