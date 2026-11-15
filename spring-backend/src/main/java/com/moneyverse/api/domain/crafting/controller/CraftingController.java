package com.moneyverse.api.domain.crafting.controller;

import com.moneyverse.api.domain.crafting.dto.CraftingDtos.*;
import com.moneyverse.api.domain.crafting.service.CraftingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Crafting System", description = "아이템 제작 레시피 조회 및 제작 집행 API")
@RestController
@RequestMapping({"/api/crafting", "/api/v1/crafting"})
public class CraftingController {

    private final CraftingService craftingService;

    public CraftingController(CraftingService craftingService) {
        this.craftingService = craftingService;
    }

    private UUID resolveUserUuid(String xUserId, String xActorUserId) {
        String raw = (xUserId != null && !xUserId.isBlank()) ? xUserId.trim()
                : (xActorUserId != null && !xActorUserId.isBlank()) ? xActorUserId.trim()
                : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            return UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20");
        }
    }

    @GetMapping({"", "/", "/recipes"})
    @Operation(summary = "공식 제작 레시피 목록 조회")
    public ResponseEntity<RecipeListResponse> listRecipes() {
        return ResponseEntity.ok(craftingService.listRecipes());
    }

    @PostMapping("/execute")
    @Operation(summary = "아이템 제작 실행")
    public ResponseEntity<ExecuteCraftingResponse> executeCrafting(
            @RequestBody ExecuteCraftingRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(craftingService.executeCrafting(userId, req));
    }
}
