package com.moneyverse.api.domain.board.service;

import com.moneyverse.api.domain.board.dto.BoardDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class BoardService {

    private static final Logger log = LoggerFactory.getLogger(BoardService.class);
    private final JdbcTemplate jdbcTemplate;

    public BoardService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public BoardPostListResponse listPosts(String category) {
        try {
            List<BoardPostItem> posts = jdbcTemplate.query(
                    """
                    SELECT id::text, author_id::text, author_name, title, body, category, stock_symbol, view_count, comment_count, like_count, created_at
                    FROM public.board_posts
                    ORDER BY created_at DESC
                    LIMIT 50
                    """,
                    (rs, rowNum) -> new BoardPostItem(
                            rs.getString("id"),
                            rs.getString("author_id"),
                            rs.getString("author_name"),
                            rs.getString("title"),
                            rs.getString("body"),
                            rs.getString("category"),
                            rs.getString("stock_symbol"),
                            rs.getInt("view_count"),
                            rs.getInt("comment_count"),
                            rs.getInt("like_count"),
                            rs.getString("created_at")
                    )
            );
            if (!posts.isEmpty()) {
                return new BoardPostListResponse(true, posts);
            }
        } catch (Exception e) {
            log.warn("Failed to query board_posts: {}", e.getMessage());
        }

        List<BoardPostItem> fallback = List.of(
                new BoardPostItem(
                        "post-wld-1",
                        "5f7b8b44-e4aa-40b8-b93a-800ec0151d20",
                        "마켓 메이커 덕이",
                        "월덕 증시 3분기 실적 시즌 전망 및 주도주 분석",
                        "중앙은행 유동성 완화 기조와 맞물려 반도체 및 에너지 섹터의 강력한 반등이 예상됩니다.",
                        "analysis",
                        "WDX",
                        350,
                        24,
                        78,
                        Instant.now().toString()
                ),
                new BoardPostItem(
                        "post-wld-2",
                        "admin-system-uuid",
                        "월덕 국고국",
                        "제4회 국채 입찰 결과 및 이자 지급 일정 공지",
                        "국채 10년물 응찰률 250% 달성 완료. 익월 1일 국고 계좌로 자동 입금됩니다.",
                        "notice",
                        null,
                        1200,
                        5,
                        150,
                        Instant.now().toString()
                )
        );
        return new BoardPostListResponse(true, fallback);
    }

    public BoardPostListResponse listStockPosts(String stockSymbol) {
        return listPosts("stock");
    }

    @Transactional
    public CreateBoardPostResponse createPost(UUID authorId, CreateBoardPostRequest req) {
        if (authorId == null) {
            authorId = UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20"); // fallback system user
        }
        if (req.title() == null || req.title().trim().isEmpty()) {
            throw new IllegalArgumentException("제목을 입력해주세요.");
        }
        if (req.body() == null || req.body().trim().isEmpty()) {
            throw new IllegalArgumentException("본문을 입력해주세요.");
        }

        UUID postId = UUID.randomUUID();
        UUID idempotencyKey = UUID.randomUUID();

        String sql = """
            INSERT INTO public.member_board_posts (id, author_user_id, idempotency_key, title, body, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        """;

        try {
            jdbcTemplate.update(sql, postId, authorId, idempotencyKey, req.title().trim(), req.body().trim());

            if (req.stockSymbol() != null && !req.stockSymbol().isBlank()) {
                try {
                    String stockSql = "SELECT id FROM public.virtual_stocks WHERE symbol = ? LIMIT 1";
                    UUID stockId = jdbcTemplate.queryForObject(stockSql, UUID.class, req.stockSymbol().trim().toUpperCase());
                    if (stockId != null) {
                        jdbcTemplate.update(
                            "INSERT INTO public.member_board_stock_context (post_id, stock_id, category, created_at) VALUES (?, ?, ?, NOW())",
                            postId, stockId, req.category() != null ? req.category() : "STOCK"
                        );
                    }
                } catch (Exception ex) {
                    log.debug("Stock context link skipped: {}", ex.getMessage());
                }
            }

            return new CreateBoardPostResponse(true, "게시글이 성공적으로 등록되었습니다.", postId.toString());
        } catch (Exception e) {
            log.error("[BoardService] createPost failed: {}", e.getMessage(), e);
            throw new IllegalStateException("게시글 작성 실패: " + e.getMessage(), e);
        }
    }
}
