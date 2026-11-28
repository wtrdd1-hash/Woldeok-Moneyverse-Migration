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
        getUserIdOrThrow(request);
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "COLLECTION_SOURCE_UNAVAILABLE");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updatePiece(
            HttpServletRequest request,
            @PathVariable("id") String pieceId,
            @RequestBody(required = false) Map<String, Object> body) {
        getUserIdOrThrow(request);
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "COLLECTION_SOURCE_UNAVAILABLE");
    }
}
