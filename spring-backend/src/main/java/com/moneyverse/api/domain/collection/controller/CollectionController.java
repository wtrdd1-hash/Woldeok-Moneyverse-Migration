package com.moneyverse.api.domain.collection.controller;

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
        "/api/v1/collections",
        "/api/collections",
        "/collections"
})
public class CollectionController {

    private final UserAuthService userAuthService;

    @Autowired
    public CollectionController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    private String getUserIdOrThrow(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return sessionOpt.get().getUserId().toString();
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listCollections(HttpServletRequest request) {
        String userId = getUserIdOrThrow(request);
        List<Map<String, Object>> items = List.of(
                Map.of("id", "piece-01", "name", "전설의 월덱 골드 코인", "rarity", "LEGENDARY", "isFavorite", true),
                Map.of("id", "piece-02", "name", "초기 중앙은행 기념주화", "rarity", "EPIC", "isFavorite", false)
        );
        return ResponseEntity.ok(Map.of(
                "success", true,
                "pieces", items,
                "totalCount", items.size()
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updatePiece(
            HttpServletRequest request,
            @PathVariable("id") String pieceId,
            @RequestBody(required = false) Map<String, Object> body) {
        String userId = getUserIdOrThrow(request);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
