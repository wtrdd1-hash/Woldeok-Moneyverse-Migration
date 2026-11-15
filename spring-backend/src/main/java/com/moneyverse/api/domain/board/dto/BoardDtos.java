package com.moneyverse.api.domain.board.dto;

import java.util.List;

public class BoardDtos {

    public record BoardPostItem(
            String id,
            String authorId,
            String authorName,
            String title,
            String body,
            String category,
            String stockSymbol,
            int viewCount,
            int commentCount,
            int likeCount,
            String createdAt
    ) {}

    public record BoardPostListResponse(
            boolean ok,
            List<BoardPostItem> posts
    ) {}

    public record CreateBoardPostRequest(
            String title,
            String body,
            String category,
            String stockSymbol,
            String idempotencyKey
    ) {}

    public record CreateBoardPostResponse(
            boolean ok,
            String message,
            String postId
    ) {}
}
