package com.moneyverse.api.domain.board.controller;

import com.moneyverse.api.domain.board.service.BoardPostsService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Member board posts and replies (QA 2026-11-25: these paths were 404 in
 * Spring). Contract ported from the NestJS BoardController / PublicBoardController:
 * a post that is not the caller's answers 404, never 403, so ids cannot be probed.
 */
@Tag(name = "Board posts", description = "Member board posts and replies via member_board_* DB functions")
@RestController
@RequestMapping({"/api/board", "/api/v1/board"})
public class BoardPostsController {
    private static final int TITLE_MAX = 120;
    private static final int BODY_MAX = 5000;
    private static final int COMMENT_MAX = 1000;
    private static final int ALT_MAX = 300;

    private final BoardPostsService board;
    private final MemberApiGuard guard;

    public BoardPostsController(BoardPostsService board, MemberApiGuard guard) {
        this.board = board;
        this.guard = guard;
    }

    @GetMapping("/posts")
    @Operation(summary = "Recent member board posts (summaries)")
    public ResponseEntity<?> list(HttpServletRequest request) {
        return privateOk(Map.of("posts", board.list(guard.actor(request))));
    }

    @GetMapping("/posts/{id}")
    @Operation(summary = "One post with its body")
    public ResponseEntity<?> read(HttpServletRequest request, @PathVariable("id") String id) {
        UUID actor = guard.actor(request);
        Optional<UUID> post = uuid(id);
        if (post.isEmpty()) return notFound();
        return board.get(actor, post.get()).<ResponseEntity<?>>map(p -> privateOk(Map.of("post", p))).orElseGet(BoardPostsController::notFound);
    }

    @PostMapping("/posts")
    @Operation(summary = "Write a post (session, CSRF, idempotency key)")
    public ResponseEntity<?> create(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        String title = clean(body, "title", TITLE_MAX, false);
        String text = clean(body, "body", BODY_MAX, true);
        String imageKey = optional(body, "imageStorageKey");
        String imageAlt = optional(body, "imageAltText");
        boolean imageValid = (imageKey == null && imageAlt == null)
                || (imageKey != null && imageAlt != null && BoardPostsService.STORAGE_KEY.matcher(imageKey).matches() && imageAlt.length() <= ALT_MAX);
        if (title == null || text == null || !imageValid) return invalid();
        UUID key = guard.idempotencyKey(field(body, "idempotencyKey"));
        return privateOk(Map.of("post", board.create(actor, title, text, key, imageKey, imageAlt)));
    }

    @PutMapping("/posts/{id}")
    @Operation(summary = "Rewrite your own post")
    public ResponseEntity<?> update(HttpServletRequest request, @PathVariable("id") String id, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        Optional<UUID> post = uuid(id);
        String title = clean(body, "title", TITLE_MAX, false);
        String text = clean(body, "body", BODY_MAX, true);
        if (post.isEmpty()) return notFound();
        if (title == null || text == null) return invalid();
        UUID key = guard.idempotencyKey(field(body, "idempotencyKey"));
        return board.update(actor, post.get(), title, text, key).<ResponseEntity<?>>map(p -> privateOk(Map.of("post", p))).orElseGet(BoardPostsController::notFound);
    }

    @DeleteMapping("/posts/{id}")
    @Operation(summary = "Delete your own post")
    public ResponseEntity<?> delete(HttpServletRequest request, @PathVariable("id") String id, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        Optional<UUID> post = uuid(id);
        if (post.isEmpty()) return notFound();
        UUID key = guard.idempotencyKey(field(body, "idempotencyKey"));
        return board.delete(actor, post.get(), key) ? ResponseEntity.noContent().build() : notFound();
    }

    @GetMapping("/posts/{id}/comments")
    @Operation(summary = "Replies on a post, oldest first")
    public ResponseEntity<?> comments(HttpServletRequest request, @PathVariable("id") String id) {
        UUID actor = guard.actor(request);
        Optional<UUID> post = uuid(id);
        if (post.isEmpty()) return notFound();
        return privateOk(Map.of("comments", board.comments(actor, post.get())));
    }

    @PostMapping("/posts/{id}/comments")
    @Operation(summary = "Reply to a post")
    public ResponseEntity<?> reply(HttpServletRequest request, @PathVariable("id") String id, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        Optional<UUID> post = uuid(id);
        String text = clean(body, "body", COMMENT_MAX, true);
        if (post.isEmpty()) return notFound();
        if (text == null) return invalid();
        UUID key = guard.idempotencyKey(field(body, "idempotencyKey"));
        return privateOk(Map.of("comment", board.reply(actor, post.get(), text, key)));
    }

    @DeleteMapping("/posts/{id}/comments/{commentId}")
    @Operation(summary = "Delete your own reply")
    public ResponseEntity<?> deleteComment(HttpServletRequest request, @PathVariable("id") String id,
            @PathVariable("commentId") String commentId, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        Optional<UUID> comment = uuid(commentId);
        if (uuid(id).isEmpty() || comment.isEmpty()) return notFound();
        UUID key = guard.idempotencyKey(field(body, "idempotencyKey"));
        return board.deleteComment(actor, comment.get(), key) ? ResponseEntity.noContent().build() : notFound();
    }

    @GetMapping("/public/posts/{id}")
    @Operation(summary = "Public board post")
    public ResponseEntity<?> publicRead(@PathVariable("id") String id) {
        Optional<UUID> post = uuid(id);
        if (post.isEmpty()) return notFound();
        return board.publicGet(post.get()).<ResponseEntity<?>>map(p -> ResponseEntity.ok(Map.of("post", p))).orElseGet(BoardPostsController::notFound);
    }

    @GetMapping("/public/posts/{id}/comments")
    @Operation(summary = "Public replies on a board post")
    public ResponseEntity<?> publicComments(@PathVariable("id") String id) {
        Optional<UUID> post = uuid(id);
        if (post.isEmpty()) return notFound();
        return ResponseEntity.ok(Map.of("comments", board.publicComments(post.get())));
    }

    // ---- helpers ----

    private static Optional<UUID> uuid(String raw) {
        try { return Optional.of(UUID.fromString(raw)); } catch (RuntimeException e) { return Optional.empty(); }
    }

    private static String field(Map<String, Object> body, String name) {
        return body != null && body.get(name) instanceof String s ? s : null;
    }

    private static String optional(Map<String, Object> body, String name) {
        String v = field(body, name);
        return v == null || v.isBlank() ? null : v.trim();
    }

    /** Trimmed text within bounds; control characters removed, newlines kept only for multi-line fields. */
    private static String clean(Map<String, Object> body, String name, int max, boolean multiline) {
        String raw = field(body, name);
        if (raw == null) return null;
        String text = raw.replace("\r\n", "\n").replace('\r', '\n');
        text = multiline ? text.replaceAll("[\\p{Cntrl}&&[^\n\t]]", "") : text.replaceAll("\\p{Cntrl}", " ");
        text = text.strip();
        return text.isEmpty() || text.length() > max ? null : text;
    }

    private static ResponseEntity<?> invalid() {
        return ResponseEntity.badRequest().body(Map.of("code", "BOARD_INPUT_INVALID"));
    }

    private static ResponseEntity<?> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("code", "BOARD_POST_NOT_FOUND"));
    }

    private static ResponseEntity<?> privateOk(Object body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(body);
    }
}
