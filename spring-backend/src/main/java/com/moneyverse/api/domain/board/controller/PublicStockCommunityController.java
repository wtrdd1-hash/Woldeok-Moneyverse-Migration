package com.moneyverse.api.domain.board.controller;

import com.moneyverse.api.domain.board.service.StockCommunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(path = {
        "/api/v1/board/public/stock-posts",
        "/api/board/public/stock-posts",
        "/board/public/stock-posts"
})
public class PublicStockCommunityController {

    private final StockCommunityService stockCommunityService;

    @Autowired
    public PublicStockCommunityController(StockCommunityService stockCommunityService) {
        this.stockCommunityService = stockCommunityService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(name = "stock", required = false) String stock,
            @RequestParam(name = "q", required = false) String query) {
        return ResponseEntity.ok(Map.of(
                "posts", stockCommunityService.publicList(stock, query)
        ));
    }
}
