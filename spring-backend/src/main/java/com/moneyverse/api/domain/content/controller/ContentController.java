package com.moneyverse.api.domain.content.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/content",
        "/api/content",
        "/content"
})
public class ContentController {

    @GetMapping("/popups")
    public ResponseEntity<Map<String, Object>> getActivePopups() {
        List<Map<String, Object>> popups = List.of(
                Map.of(
                        "id", "popup-season-12",
                        "title", "2026 하반기 클럽 대항전 개막!",
                        "imageUrl", "/media/banners/season-12-popup.webp",
                        "linkUrl", "/clubs/warfare",
                        "priority", 100,
                        "dismissible24h", true
                )
        );
        return ResponseEntity.ok(Map.of("popups", popups));
    }

    @GetMapping("/pages/{slug}")
    public ResponseEntity<Map<String, Object>> getStaticPage(@PathVariable("slug") String slug) {
        Map<String, Object> page = new LinkedHashMap<>();
        page.put("slug", slug);
        page.put("title", "terms".equalsIgnoreCase(slug) ? "이용약관" : "서비스 규정");
        page.put("contentMarkdown", "# 머니버스 서비스 규정\n\n공정한 금융 생태계와 안정적인 경제 활동을 위한 전역 정책입니다.");
        page.put("updatedAt", "2026-11-01T00:00:00Z");
        return ResponseEntity.ok(page);
    }

    @PostMapping("/banners/{id}/click")
    public ResponseEntity<Map<String, Object>> recordBannerClick(@PathVariable("id") String id) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("bannerId", id);
        res.put("recordedAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }
}
