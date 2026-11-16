package com.moneyverse.api.domain.board.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StockCommunityService {

    private final JdbcTemplate jdbcTemplate;

    @Autowired(required = false)
    public StockCommunityService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> createPost(String userId, Map<String, Object> body) {
        String postId = UUID.randomUUID().toString();
        String title = (String) body.getOrDefault("title", "");
        String postBody = (String) body.getOrDefault("body", "");
        String stockSymbol = (String) body.getOrDefault("stockSymbol", "WDX");
        String category = (String) body.getOrDefault("category", "analysis");
        String stance = (String) body.getOrDefault("stance", "neutral");
        String positionDisclosure = (String) body.getOrDefault("positionDisclosure", "holder");

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", postId);
        res.put("authorUserId", userId);
        res.put("title", title);
        res.put("body", postBody);
        res.put("stockSymbol", stockSymbol);
        res.put("category", category);
        res.put("stance", stance);
        res.put("positionDisclosure", positionDisclosure);
        res.put("viewCount", 0);
        res.put("likeCount", 0);
        res.put("createdAt", new Date().toInstant().toString());
        return res;
    }

    public List<Map<String, Object>> publicList(String stockSymbol, String query) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", "stock-post-01");
        item.put("authorUserId", "user-analyst-01");
        item.put("authorName", "여의도 분석가");
        item.put("title", "삼성전자 파운드리 수주 전망 및 4분기 실적 분석");
        item.put("stockSymbol", "KRX_005930");
        item.put("category", "analysis");
        item.put("stance", "bullish");
        item.put("positionDisclosure", "holder");
        item.put("viewCount", 1420);
        item.put("likeCount", 89);
        item.put("createdAt", new Date().toInstant().toString());
        return List.of(item);
    }
}
