package com.moneyverse.api.domain.shop.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.util.List;

public final class ShopDtos {

    private ShopDtos() {}

    public record ShopCatalogItem(
            @JsonProperty("item_id") String itemId,
            @JsonProperty("name") String name,
            @JsonProperty("description") String description,
            @JsonProperty("category") String category,
            @JsonProperty("price") String price,
            @JsonProperty("upkeep_cost") String upkeepCost,
            @JsonProperty("stock_remaining") int stockRemaining
    ) implements Serializable {}

    public record ShopCatalogListResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("items") List<ShopCatalogItem> items
    ) implements Serializable {}

    public record ShopInventoryItem(
            @JsonProperty("inventory_id") String inventoryId,
            @JsonProperty("item_id") String itemId,
            @JsonProperty("name") String name,
            @JsonProperty("category") String category,
            @JsonProperty("quantity") int quantity,
            @JsonProperty("acquired_at") String acquiredAt
    ) implements Serializable {}

    public record ShopInventoryResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("inventory") List<ShopInventoryItem> inventory
    ) implements Serializable {}

    public record ShopPurchaseRequest(
            @JsonProperty("item_id") String itemId,
            @JsonProperty("quantity") int quantity
    ) implements Serializable {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ShopPurchaseResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("purchase_id") String purchaseId,
            @JsonProperty("total_price") String totalPrice,
            @JsonProperty("tax_paid") String taxPaid,
            @JsonProperty("message") String message,
            @JsonProperty("error") String error
    ) implements Serializable {
        public static ShopPurchaseResponse ok(String purchaseId, String totalPrice, String taxPaid) {
            return new ShopPurchaseResponse(true, purchaseId, totalPrice, taxPaid, "아이템 구매 및 10% 소비세 국고 편입이 완료되었습니다.", null);
        }
        public static ShopPurchaseResponse fail(String error) {
            return new ShopPurchaseResponse(false, null, "0", "0", null, error);
        }
    }

    public record CraftingRecipe(
            @JsonProperty("recipe_id") String recipeId,
            @JsonProperty("name") String name,
            @JsonProperty("output_item_name") String outputItemName,
            @JsonProperty("required_materials") String requiredMaterials,
            @JsonProperty("success_rate") int successRate
    ) implements Serializable {}

    public record CraftingRecipesResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("recipes") List<CraftingRecipe> recipes
    ) implements Serializable {}

    public record CraftExecuteRequest(
            @JsonProperty("recipe_id") String recipeId
    ) implements Serializable {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record CraftExecuteResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("result_item_name") String resultItemName,
            @JsonProperty("is_success") boolean isSuccess,
            @JsonProperty("message") String message,
            @JsonProperty("error") String error
    ) implements Serializable {
        public static CraftExecuteResponse ok(String resultItemName, boolean isSuccess) {
            String msg = isSuccess ? "장비 제작에 성공하였습니다!" : "아쉽게도 제작에 실패하여 재료 일부가 손실되었습니다.";
            return new CraftExecuteResponse(true, resultItemName, isSuccess, msg, null);
        }
        public static CraftExecuteResponse fail(String error) {
            return new CraftExecuteResponse(false, null, false, null, error);
        }
    }
}
