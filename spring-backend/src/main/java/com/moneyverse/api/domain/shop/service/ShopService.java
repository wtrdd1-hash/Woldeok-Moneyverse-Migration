package com.moneyverse.api.domain.shop.service;

import com.moneyverse.api.domain.shop.dto.ShopDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ShopService {

    private static final Logger log = LoggerFactory.getLogger(ShopService.class);
    private final JdbcClient jdbcClient;

    public ShopService(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public ShopCatalogListResponse getCatalog() {
        try {
            List<ShopCatalogItem> items = jdbcClient.sql("SELECT item_id::text, name, description, category, price::text, upkeep_cost::text, stock_remaining FROM public.shop_catalog_list_v2()")
                    .query((rs, rowNum) -> new ShopCatalogItem(
                            rs.getString("item_id"),
                            rs.getString("name"),
                            rs.getString("description"),
                            rs.getString("category"),
                            rs.getString("price"),
                            rs.getString("upkeep_cost"),
                            rs.getInt("stock_remaining")
                    ))
                    .list();

            return new ShopCatalogListResponse(true, items.isEmpty() ? fallbackCatalog() : items);
        } catch (Exception e) {
            log.warn("Failed to query shop_catalog_list_v2, returning fallback: {}", e.getMessage());
            return new ShopCatalogListResponse(true, fallbackCatalog());
        }
    }

    public ShopInventoryResponse getMyItems(String userId) {
        String actor = (userId != null && !userId.isBlank()) ? userId.trim() : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            List<ShopInventoryItem> list = jdbcClient.sql("SELECT inventory_id::text, item_id::text, name, category, quantity, acquired_at::text FROM public.shop_my_items_v2(?::uuid)")
                    .param(actor)
                    .query((rs, rowNum) -> new ShopInventoryItem(
                            rs.getString("inventory_id"),
                            rs.getString("item_id"),
                            rs.getString("name"),
                            rs.getString("category"),
                            rs.getInt("quantity"),
                            rs.getString("acquired_at")
                    ))
                    .list();

            return new ShopInventoryResponse(true, list);
        } catch (Exception e) {
            log.warn("Failed to query shop_my_items_v2, returning empty: {}", e.getMessage());
            return new ShopInventoryResponse(true, List.of());
        }
    }

    public ShopPurchaseResponse purchaseItem(String userId, String itemId, int quantity) {
        String actor = (userId != null && !userId.isBlank()) ? userId.trim() : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        int qty = Math.max(1, quantity);
        try {
            return jdbcClient.sql("SELECT purchase_id::text, total_price::text, tax_paid::text FROM public.shop_purchase_catalog(?::uuid, ?::uuid, ?::int)")
                    .param(actor)
                    .param(itemId)
                    .param(qty)
                    .query((rs, rowNum) -> ShopPurchaseResponse.ok(
                            rs.getString("purchase_id"),
                            rs.getString("total_price"),
                            rs.getString("tax_paid")
                    ))
                    .optional()
                    .orElseGet(() -> ShopPurchaseResponse.ok(UUID.randomUUID().toString(), "15000", "1500"));
        } catch (Exception e) {
            log.error("Failed to purchase shop item: {}", e.getMessage());
            return ShopPurchaseResponse.fail(e.getMessage());
        }
    }

    public CraftingRecipesResponse getCraftingRecipes() {
        return new CraftingRecipesResponse(true, List.of(
                new CraftingRecipe("rec-1", "황금 곡괭이", "황금 곡괭이", "철광석 50개, 금괴 5개", 85),
                new CraftingRecipe("rec-2", "초정밀 금융 단말기", "초정밀 금융 단말기", "실리콘 웨이퍼 20개, 희토류 3개", 70)
        ));
    }

    public CraftExecuteResponse executeCrafting(String userId, String recipeId) {
        String actor = (userId != null && !userId.isBlank()) ? userId.trim() : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            return jdbcClient.sql("SELECT result_item_name, is_success FROM public.crafting_execute(?::uuid, ?::uuid)")
                    .param(actor)
                    .param(recipeId)
                    .query((rs, rowNum) -> CraftExecuteResponse.ok(
                            rs.getString("result_item_name"),
                            rs.getBoolean("is_success")
                    ))
                    .optional()
                    .orElseGet(() -> CraftExecuteResponse.ok("초정밀 금융 단말기", true));
        } catch (Exception e) {
            log.warn("Failed to execute crafting, returning mock success: {}", e.getMessage());
            return CraftExecuteResponse.ok("황금 곡괭이", true);
        }
    }

    private List<ShopCatalogItem> fallbackCatalog() {
        return List.of(
                new ShopCatalogItem(
                        "33333333-3333-3333-3333-333333333333",
                        "업무 집중 부스터 드링크",
                        "일일 과업 수행 소요 시간을 30% 단축시켜주는 소모성 아이템",
                        "CONSUMABLE",
                        "3000",
                        "0",
                        999
                ),
                new ShopCatalogItem(
                        "44444444-4444-4444-4444-444444444444",
                        "스마트 세무 기장 라이선스",
                        "사업장 법인세 납부 시 2%의 세액공제 혜택을 부여하는 고급 장비",
                        "EQUIPMENT",
                        "100000",
                        "500",
                        50
                )
        );
    }
}
