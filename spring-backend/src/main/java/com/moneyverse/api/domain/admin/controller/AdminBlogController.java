package com.moneyverse.api.domain.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Tag(name = "Admin Verified Blog", description = "AI 생성 다국어 경제/기술 블로그 발행 관리 API")
@RestController
@RequestMapping(path = {
        "/api/v1/admin/blog-verified",
        "/api/admin/blog-verified",
        "/admin/blog-verified"
})
public class AdminBlogController {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    private final com.moneyverse.api.domain.admin.service.AdminAuthService adminAuth;

    public AdminBlogController(JdbcTemplate jdbcTemplate, com.moneyverse.api.domain.admin.service.AdminAuthService adminAuth) {
        this.adminAuth = adminAuth;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Operation(summary = "발행된 블로그 기사 전체 목록 조회")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getVerifiedBlogPosts(jakarta.servlet.http.HttpServletRequest request) {
        // blog_verified_articles is not granted to the application role; blog_verified_admin_list checks
        // the administrator itself. The page lists published articles, as before.
        java.util.UUID admin = adminAuth.resolveVerifiedAdminActor(request).orElseThrow(() ->
                new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "ADMIN_SESSION_REQUIRED"));
        String sql = """
            SELECT slug, country, locale, topic, title, excerpt, content,
                   primary_source_url, receipt::text AS receipt, status,
                   to_char(published_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS published_at,
                   to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS updated_at
            FROM public.blog_verified_admin_list(?::uuid)
            WHERE status = 'PUBLISHED'
            ORDER BY published_at DESC
        """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, admin);
        return ResponseEntity.ok(Map.of("posts", rows));
    }
}
