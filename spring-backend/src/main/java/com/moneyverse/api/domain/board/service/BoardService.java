package com.moneyverse.api.domain.board.service;

import com.moneyverse.api.domain.board.dto.BoardDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

/** Real public board source, never a fallback invented post/receipt. */
@Service
public class BoardService {
    private static final Logger log = LoggerFactory.getLogger(BoardService.class);
    private final JdbcTemplate jdbcTemplate;

    public BoardService(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    public BoardPostListResponse listPosts(String category) {
        String c = category == null || category.isBlank() ? null : category.trim();
        if (c != null && !c.matches("[a-zA-Z0-9_-]{1,32}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_BOARD_CATEGORY");
        }
        return readFromCanonicalBoard(c, null, false);
    }

    public BoardPostListResponse listStockPosts(String stockSymbol) {
        String symbol = stockSymbol == null || stockSymbol.isBlank() ? null : stockSymbol.trim();
        if (symbol != null && !symbol.matches("[a-zA-Z0-9._-]{1,16}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_STOCK_SYMBOL");
        }
        return readFromCanonicalBoard(null, symbol, true);
    }

    private BoardPostListResponse readFromCanonicalBoard(String category, String stockSymbol, boolean stockOnly) {
        try {
            // Canonical public PostgreSQL security-definer function; 50 latest source records only.
            // The function returns no body/view/like count or author UUID in this list contract.
            // Their response fields must be null, NOT synthesized zeros or invented identities.
            List<BoardPostItem> posts = jdbcTemplate.query("""
                    SELECT post_id::text, title, author_name, created_at, comment_count,
                           category, stock_symbol
                    FROM public.member_board_public_list_with_stock(?::int)
                    WHERE (?::text IS NULL OR category = ?::text)
                      AND (?::boolean = false OR stock_symbol IS NOT NULL)
                      AND (?::text IS NULL OR upper(stock_symbol) = upper(?::text))
                    ORDER BY created_at DESC, post_id DESC
                    """, (rs, n) -> {
                        String id = rs.getString("post_id");
                        if (id == null) throw new IllegalStateException("BOARD_ID_UNKNOWN");
                        UUID.fromString(id); // validate source record identifier
                        Timestamp created = rs.getTimestamp("created_at");
                        if (created == null) throw new IllegalStateException("BOARD_CREATED_AT_UNKNOWN");
                        long count = rs.getLong("comment_count");
                        if (rs.wasNull() || count < 0 || count > Integer.MAX_VALUE)
                            throw new IllegalStateException("BOARD_COMMENT_COUNT_INVALID");
                        String title = rs.getString("title");
                        if (title == null || title.isBlank()) throw new IllegalStateException("BOARD_TITLE_INVALID");
                        return new BoardPostItem(id, null, rs.getString("author_name"), title, null,
                                rs.getString("category"), rs.getString("stock_symbol"), null,
                                (int)count, null, created.toInstant().toString());
                    }, 50, category, category, stockOnly, stockSymbol, stockSymbol);
            return new BoardPostListResponse(true, posts);
        } catch (Exception e) {
            log.warn("Canonical public board source unavailable; returning 503 without fabricated posts");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BOARD_SOURCE_UNAVAILABLE");
        }
    }

    public CreateBoardPostResponse createPost(UUID authorId, CreateBoardPostRequest request, UUID idempotencyKey) {
        if (authorId == null || request == null || idempotencyKey == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_BOARD_CREATE_INPUT");
        try {
            // Canonical idempotent DB write; success requires a *real* returned post UUID.
            String postId = jdbcTemplate.queryForObject("""
                    SELECT post_id::text
                    FROM public.member_board_create(?::uuid, ?::text, ?::text, ?::uuid)
                    """, (rs, n) -> rs.getString("post_id"), authorId,
                    request.title().strip(), request.body().strip(), idempotencyKey);
            if (postId == null) throw new IllegalStateException("BOARD_CREATE_RECEIPT_MISSING");
            UUID.fromString(postId);
            return new CreateBoardPostResponse(true, "게시글이 실제 DB에 저장되었습니다.", postId);
        } catch (Exception e) {
            log.warn("Canonical board write did not provide a verified receipt; returning 503");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BOARD_WRITE_SOURCE_UNAVAILABLE");
        }
    }
}
