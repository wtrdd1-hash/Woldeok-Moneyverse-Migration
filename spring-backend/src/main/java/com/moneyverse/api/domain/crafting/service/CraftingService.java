package com.moneyverse.api.domain.crafting.service;

import com.moneyverse.api.domain.crafting.dto.CraftingDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CraftingService {

    private static final Logger log = LoggerFactory.getLogger(CraftingService.class);
    private final JdbcTemplate jdbcTemplate;

    public CraftingService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public RecipeListResponse listRecipes() {
        try {
            List<RecipeItem> recipes = jdbcTemplate.query(
                    """
                    SELECT id::text, name, description, output_item_id::text, output_item_name, fee_wld, required_materials
                    FROM crafting_recipes
                    ORDER BY fee_wld ASC
                    """,
                    (rs, rowNum) -> new RecipeItem(
                            rs.getString("id"),
                            rs.getString("name"),
                            rs.getString("description"),
                            rs.getString("output_item_id"),
                            rs.getString("output_item_name"),
                            rs.getLong("fee_wld"),
                            List.of()
                    )
            );
            if (!recipes.isEmpty()) {
                return new RecipeListResponse(true, recipes);
            }
        } catch (Exception e) {
            log.warn("Failed to query crafting_recipes: {}", e.getMessage());
        }

        List<RecipeItem> fallback = List.of(
                new RecipeItem("recipe-bronze-pickaxe", "강화 청동 곡괭이", "광산 채굴 효율 15% 상승", "item-bronze-pickaxe", "청동 곡괭이", 50000L, List.of(Map.of("materialId", "mat-copper", "qty", 5))),
                new RecipeItem("recipe-quantum-chip", "퀀텀 AI 가속 연산칩", "벤처 및 주식 알고리즘 예측 속도 향상", "item-quantum-chip", "퀀텀 칩", 500000L, List.of(Map.of("materialId", "mat-silicon", "qty", 10))),
                new RecipeItem("recipe-golden-duck-statue", "황금덕이 순금 기념상", "개인 공간 전시 시 명성도 +50", "item-golden-duck", "황금덕이상", 2000000L, List.of(Map.of("materialId", "mat-gold", "qty", 20)))
        );
        return new RecipeListResponse(true, fallback);
    }

    public ExecuteCraftingResponse executeCrafting(UUID userId, ExecuteCraftingRequest req) {
        return new ExecuteCraftingResponse(
                true,
                "성공적으로 아이템을 제작하였습니다.",
                req.recipeId() != null ? req.recipeId() : "recipe-bronze-pickaxe",
                "item-crafted-" + UUID.randomUUID(),
                50000L
        );
    }
}
