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
        // Security review 2026-11-28: this answered with constants an operator would act on.
        // Unavailable until read from its canonical source; never invented evidence.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "GAME_CATALOG_SOURCE_UNAVAILABLE");
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registerGame(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "GAME_CATALOG_SOURCE_UNAVAILABLE");
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateGameConfig(
            HttpServletRequest request,
            @PathVariable("id") String id,
            @RequestBody(required = false) Map<String, Object> body) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "GAME_CATALOG_SOURCE_UNAVAILABLE");
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleGameStatus(
            HttpServletRequest request,
            @PathVariable("id") String id) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "GAME_CATALOG_SOURCE_UNAVAILABLE");
    }
}
