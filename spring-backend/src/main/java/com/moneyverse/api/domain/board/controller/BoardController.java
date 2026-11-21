package com.moneyverse.api.domain.board.controller;

import com.moneyverse.api.domain.board.dto.BoardDtos.*;
import com.moneyverse.api.domain.board.service.BoardService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;
import java.util.UUID;

@Tag(name = "Community & Discussion Board", description = "DB-origin public community listings and session-backed post creation")
@RestController
@RequestMapping({"/api/board", "/api/v1/board"})
public class BoardController {
    private final BoardService service;
    private final UserAuthService auth;

    public BoardController(BoardService service, UserAuthService auth) {
        this.service=service;this.auth=auth;
    }

    @GetMapping({"", "/"})
    @Operation(summary = "실제 공개 게시판 글 목록 조회")
    public ResponseEntity<BoardPostListResponse> listPosts(@RequestParam(value="category",required=false) String category) {
        return ResponseEntity.ok(service.listPosts(category));
    }

    @GetMapping({"/stock-posts", "/stocks"})
    @Operation(summary = "실제 종목 토론방 글 조회")
    public ResponseEntity<BoardPostListResponse> listStockPosts(@RequestParam(value="stockSymbol",required=false) String stockSymbol) {
        return ResponseEntity.ok(service.listStockPosts(stockSymbol));
    }

    @PostMapping({"", "/"})
    @Operation(summary = "검증된 사용자 세션으로 실제 게시글을 저장하고 영수증 반환")
    public ResponseEntity<?> createPost(HttpServletRequest http, @RequestBody(required=false) CreateBoardPostRequest input) {
        Optional<SessionInfo> active = auth.resolveSession(http);
        if(active.isEmpty() || !active.get().isSignedIn() || active.get().getUserId()==null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("ok",false,"code","MEMBER_SESSION_REQUIRED"));
        UUID actor=active.get().getUserId();
        if(!matchesActor(http.getHeader("X-User-Id"),actor)||!matchesActor(http.getHeader("x-actor-user-id"),actor))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("ok",false,"code","FORGED_ACTOR_HEADER"));
        if(!matchesCsrf(active.get().getCsrfHash(),http.getHeader("X-CSRF-Token")))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("ok",false,"code","CSRF_REQUIRED"));
        if(input==null || input.title()==null || input.body()==null || input.idempotencyKey()==null)
            return ResponseEntity.badRequest().body(java.util.Map.of("ok",false,"code","INVALID_BOARD_POST"));
        String title=input.title().strip(), body=input.body().strip();
        if(title.isEmpty()||title.length()>120||body.isEmpty()||body.length()>5000)
            return ResponseEntity.badRequest().body(java.util.Map.of("ok",false,"code","INVALID_BOARD_TEXT"));
        if((input.stockSymbol()!=null && !input.stockSymbol().isBlank())
                || (input.category()!=null && !input.category().isBlank() && !"general".equalsIgnoreCase(input.category())))
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(java.util.Map.of("ok",false,"code","STOCK_TAGGED_POST_REQUIRES_VERIFIED_TAGGED_CONTRACT"));
        UUID key;
        try{key=UUID.fromString(input.idempotencyKey());}
        catch(Exception ex){return ResponseEntity.badRequest().body(java.util.Map.of("ok",false,"code","INVALID_IDEMPOTENCY_KEY"));}
        return ResponseEntity.ok(service.createPost(actor,input,key));
    }

    private static boolean matchesActor(String header,UUID verified) {
        if(header==null||header.isBlank())return true;
        try{return UUID.fromString(header.trim()).equals(verified);}catch(Exception ex){return false;}
    }

    private static boolean matchesCsrf(String storedHash,String rawHeader) {
        if(storedHash==null||storedHash.isBlank()||rawHeader==null||rawHeader.isBlank())return false;
        String received=UserAuthService.sha256(rawHeader);
        return MessageDigest.isEqual(storedHash.getBytes(StandardCharsets.UTF_8),received.getBytes(StandardCharsets.UTF_8));
    }
}
