package com.moneyverse.api.domain.board;

import com.moneyverse.api.domain.board.controller.BoardPostsController;
import com.moneyverse.api.domain.board.service.BoardPostsService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * QA 2026-11-25: /board post detail, writing, editing, deleting and replies
 * called /api/v1/board/posts/**, which Spring never mapped (404). They go
 * through the member_board_* DB functions with the verified session owner.
 */
class BoardPostsContractTest {
    static final UUID ACTOR = UUID.fromString("00000000-0000-4000-8000-000000000123");
    static final UUID POST = UUID.fromString("11111111-1111-4111-8111-111111111111");
    static final String KEY = "6f1c1d36-8d0a-4a39-9d65-1a2b3c4d5e6f";

    final MemberApiGuard guard = mock(MemberApiGuard.class);
    final BoardPostsService board = mock(BoardPostsService.class);
    final HttpServletRequest request = mock(HttpServletRequest.class);
    final BoardPostsController controller = new BoardPostsController(board, guard);

    @Test void readingSomeoneElsesOrAMissingPostIs404() {
        when(guard.actor(request)).thenReturn(ACTOR);
        when(board.get(ACTOR, POST)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND, controller.read(request, POST.toString()).getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, controller.read(request, "not-a-uuid").getStatusCode());
    }

    @Test void writeUsesTheVerifiedActorAndValidatedText() {
        when(guard.verifiedMutationActor(request)).thenReturn(ACTOR);
        when(guard.idempotencyKey(KEY)).thenReturn(UUID.fromString(KEY));
        when(board.create(eq(ACTOR), eq("제목"), eq("본문"), eq(UUID.fromString(KEY)), isNull(), isNull())).thenReturn(Map.of("postId", POST.toString()));
        var res = controller.create(request, Map.of("title", "  제목 ", "body", "본문", "idempotencyKey", KEY));
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(Map.of("post", Map.of("postId", POST.toString())), res.getBody());
    }

    @Test void emptyOrOversizedTextNeverReachesTheDatabase() {
        when(guard.verifiedMutationActor(request)).thenReturn(ACTOR);
        when(guard.idempotencyKey(KEY)).thenReturn(UUID.fromString(KEY));
        assertEquals(HttpStatus.BAD_REQUEST, controller.create(request, Map.of("title", " ", "body", "x", "idempotencyKey", KEY)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.create(request, Map.of("title", "t", "body", "x".repeat(5001), "idempotencyKey", KEY)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.reply(request, POST.toString(), Map.of("body", "", "idempotencyKey", KEY)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.create(request, Map.of("title", "t", "body", "x", "imageStorageKey", "../etc/passwd", "imageAltText", "a", "idempotencyKey", KEY)).getStatusCode());
        verifyNoInteractions(board);
    }

    @Test void deletingAPostThatIsNotYoursIs404NotForbidden() {
        when(guard.verifiedMutationActor(request)).thenReturn(ACTOR);
        when(guard.idempotencyKey(KEY)).thenReturn(UUID.fromString(KEY));
        when(board.delete(ACTOR, POST, UUID.fromString(KEY))).thenReturn(false);
        assertEquals(HttpStatus.NOT_FOUND, controller.delete(request, POST.toString(), Map.of("idempotencyKey", KEY)).getStatusCode());
        when(board.delete(ACTOR, POST, UUID.fromString(KEY))).thenReturn(true);
        assertEquals(HttpStatus.NO_CONTENT, controller.delete(request, POST.toString(), Map.of("idempotencyKey", KEY)).getStatusCode());
    }

    @Test void writesWithoutCsrfNeverReachTheDatabase() {
        when(guard.verifiedMutationActor(request)).thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "CSRF_REQUIRED"));
        assertThrows(ResponseStatusException.class, () -> controller.create(request, Map.of("title", "t", "body", "b", "idempotencyKey", KEY)));
        verifyNoInteractions(board);
    }

    @Test void rowsAreMappedToTheFrontendShapeAndImagesGoThroughTheMediaRoute() {
        Map<String, Object> row = new HashMap<>();
        row.put("post_id", POST.toString()); row.put("title", "t"); row.put("body", "b");
        row.put("author_name", "덕이"); row.put("author_user_id", ACTOR.toString());
        row.put("created_at", OffsetDateTime.parse("2026-11-25T01:00:00Z")); row.put("updated_at", null);
        row.put("mine", true); row.put("image_storage_key", "0f1c1d36-8d0a-4a39-9d65-1a2b3c4d5e6f.png"); row.put("image_alt_text", "그림");
        Map<String, Object> post = BoardPostsService.post(row);
        assertEquals(POST.toString(), post.get("postId"));
        assertEquals("2026-11-25T01:00:00Z", post.get("createdAt"));
        assertNull(post.get("updatedAt"));
        assertEquals("/media/board/0f1c1d36-8d0a-4a39-9d65-1a2b3c4d5e6f.png", post.get("imageUrl"));
        assertEquals(Boolean.TRUE, post.get("mine"));
    }

    @Test void databaseOutageIsUnavailableNeverAnEmptyBoard() {
        JdbcClient jdbc = mock(JdbcClient.class);
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        var service = new BoardPostsService(jdbc);
        var e = assertThrows(ResponseStatusException.class, () -> service.list(ACTOR));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, e.getStatusCode());
        assertThrows(ResponseStatusException.class, () -> service.publicGet(POST));
        assertThrows(ResponseStatusException.class, () -> service.comments(ACTOR, POST));
    }

    @Test void publicReadsNeedNoSession() {
        when(board.publicGet(POST)).thenReturn(Optional.of(Map.of("postId", POST.toString())));
        when(board.publicComments(POST)).thenReturn(List.of());
        assertEquals(HttpStatus.OK, controller.publicRead(POST.toString()).getStatusCode());
        assertEquals(HttpStatus.OK, controller.publicComments(POST.toString()).getStatusCode());
        verifyNoInteractions(guard);
    }
}
