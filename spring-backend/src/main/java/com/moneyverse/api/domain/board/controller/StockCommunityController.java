package com.moneyverse.api.domain.board.controller;

import com.moneyverse.api.domain.board.service.StockCommunityService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping(path = {
        "/api/v1/board/stock-posts",
        "/api/board/stock-posts",
        "/board/stock-posts"
})
public class StockCommunityController {

    private final StockCommunityService stockCommunityService;
    private final UserAuthService userAuthService;

    @Autowired
    public StockCommunityController(StockCommunityService stockCommunityService, UserAuthService userAuthService) {
        this.stockCommunityService = stockCommunityService;
        this.userAuthService = userAuthService;
    }

    private String getUserIdOrThrow(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return sessionOpt.get().getUserId().toString();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        String userId = getUserIdOrThrow(request);
        return ResponseEntity.ok(Map.of(
                "post", stockCommunityService.createPost(userId, body)
        ));
    }
}
