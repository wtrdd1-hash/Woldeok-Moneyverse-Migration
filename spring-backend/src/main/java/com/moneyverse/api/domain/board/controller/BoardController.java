package com.moneyverse.api.domain.board.controller;

import com.moneyverse.api.domain.board.dto.BoardDtos.*;
import com.moneyverse.api.domain.board.service.BoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Community & Discussion Board", description = "전체 게시판 및 종목별 투자 커뮤니티 토론 API")
@RestController
@RequestMapping({"/api/board", "/api/v1/board"})
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    private UUID resolveUserUuid(String xUserId, String xActorUserId) {
        String raw = (xUserId != null && !xUserId.isBlank()) ? xUserId.trim()
                : (xActorUserId != null && !xActorUserId.isBlank()) ? xActorUserId.trim()
                : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            return UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20");
        }
    }

    @GetMapping({"", "/"})
    @Operation(summary = "전체 게시판 글 목록 조회")
    public ResponseEntity<BoardPostListResponse> listPosts(
            @RequestParam(value = "category", required = false) String category
    ) {
        return ResponseEntity.ok(boardService.listPosts(category));
    }

    @GetMapping({"/stock-posts", "/stocks"})
    @Operation(summary = "종목 토론방 글 목록 조회")
    public ResponseEntity<BoardPostListResponse> listStockPosts(
            @RequestParam(value = "stockSymbol", required = false) String stockSymbol
    ) {
        return ResponseEntity.ok(boardService.listStockPosts(stockSymbol));
    }

    @PostMapping({"", "/"})
    @Operation(summary = "새 게시글 작성")
    public ResponseEntity<?> createPost(
            @RequestBody CreateBoardPostRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        try {
            UUID userId = resolveUserUuid(xUserId, xActorUserId);
            return ResponseEntity.ok(boardService.createPost(userId, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("ok", false, "message", e.getMessage()));
        }
    }
}
