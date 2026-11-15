package com.moneyverse.api.domain.crafting.dto;

import java.util.List;
import java.util.Map;

public class CraftingDtos {

    public record RecipeItem(
            String id,
            String name,
            String description,
            String outputItemId,
            String outputItemName,
            long feeWld,
            List<Map<String, Object>> requiredMaterials
    ) {}

    public record RecipeListResponse(
            boolean ok,
            List<RecipeItem> recipes
    ) {}

    public record ExecuteCraftingRequest(
            String recipeId,
            String idempotencyKey
    ) {}

    public record ExecuteCraftingResponse(
            boolean ok,
            String message,
            String recipeId,
            String craftedItemId,
            long feePaidWld
    ) {}
}
