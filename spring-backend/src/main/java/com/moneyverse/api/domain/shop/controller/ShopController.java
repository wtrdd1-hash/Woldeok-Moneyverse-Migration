package com.moneyverse.api.domain.shop.controller;

import com.moneyverse.api.domain.shop.dto.ShopDtos.*;
import com.moneyverse.api.domain.shop.service.ShopService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Shop, Inventory & Crafting", description = "아이템 상점, 10% 소비세 납입, 인벤토리 도감 및 장비 제작 API")
@RestController
@RequestMapping({"/api/shop", "/api/v1/shop"})
public class ShopController {

    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    private String resolveUserId(String xUserId, String xActorUserId) {
        if (xUserId != null && !xUserId.isBlank()) return xUserId.trim();
        if (xActorUserId != null && !xActorUserId.isBlank()) return xActorUserId.trim();
        return "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
    }

    @GetMapping({"", "/", "/catalog", "/items"})
    @Operation(summary = "상점에서 판매 중인 물품 목록 및 재고 조회")
    public ResponseEntity<ShopCatalogListResponse> getCatalog() {
        return ResponseEntity.ok(shopService.getCatalog());
    }

    @GetMapping({"/inventory", "/my-items"})
    @Operation(summary = "내가 소유한 아이템 인벤토리 및 도감 조회")
    public ResponseEntity<ShopInventoryResponse> getMyInventory(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        String userId = resolveUserId(xUserId, xActorUserId);
        return ResponseEntity.ok(shopService.getMyItems(userId));
    }

    @PostMapping("/purchase")
    @Operation(summary = "아이템 구매 (국고 10% 부가가치세 자동 편입)")
    public ResponseEntity<ShopPurchaseResponse> purchaseItem(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId,
            @RequestBody ShopPurchaseRequest request
    ) {
        String userId = resolveUserId(xUserId, xActorUserId);
        if (request == null || request.itemId() == null || request.itemId().isBlank()) {
            return ResponseEntity.badRequest().body(ShopPurchaseResponse.fail("item_id is required"));
        }
        int quantity = request.quantity() > 0 ? request.quantity() : 1;
        ShopPurchaseResponse response = shopService.purchaseItem(userId, request.itemId(), quantity);
        return response.success() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/crafting/recipes")
    @Operation(summary = "장비 및 아이템 제작 레시피 목록 조회")
    public ResponseEntity<CraftingRecipesResponse> getCraftingRecipes() {
        return ResponseEntity.ok(shopService.getCraftingRecipes());
    }

    @PostMapping("/crafting/craft")
    @Operation(summary = "레시피 기반 아이템 제작 실행")
    public ResponseEntity<CraftExecuteResponse> executeCraft(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId,
            @RequestBody CraftExecuteRequest request
    ) {
        String userId = resolveUserId(xUserId, xActorUserId);
        if (request == null || request.recipeId() == null || request.recipeId().isBlank()) {
            return ResponseEntity.badRequest().body(CraftExecuteResponse.fail("recipe_id is required"));
        }
        CraftExecuteResponse response = shopService.executeCrafting(userId, request.recipeId());
        return response.success() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }
}
