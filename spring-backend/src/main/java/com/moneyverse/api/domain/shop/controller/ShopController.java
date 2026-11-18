package com.moneyverse.api.domain.shop.controller;

import com.moneyverse.api.domain.shop.dto.ShopDtos.*;
import com.moneyverse.api.domain.shop.service.ShopService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;
import java.util.UUID;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Shop, Inventory & Crafting", description = "아이템 상점, 10% 소비세 납입, 인벤토리 도감 및 장비 제작 API")
@RestController
@RequestMapping({"/api/shop", "/api/v1/shop"})
public class ShopController {

    private final ShopService shopService;
    private final UserAuthService userAuthService;

    public ShopController(ShopService shopService, UserAuthService userAuthService) {
        this.shopService = shopService;
        this.userAuthService = userAuthService;
    }

    private Optional<UserAuthService.SessionInfo> verifiedMember(HttpServletRequest request) {
        return userAuthService.resolveSession(request).filter(UserAuthService.SessionInfo::isSignedIn);
    }

    private boolean verifiedCsrf(UserAuthService.SessionInfo session, String supplied) {
        if (supplied == null || supplied.isBlank() || session.getCsrfHash() == null) return false;
        byte[] expected = session.getCsrfHash().getBytes(StandardCharsets.UTF_8);
        byte[] actual = UserAuthService.sha256(supplied).getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, actual);
    }

    @GetMapping({"", "/", "/catalog", "/items"})
    @Operation(summary = "정본 아이템 카탈로그: 기존 API items 및 신규 UI catalogItems")
    public ResponseEntity<ShopCatalogListResponse> getCatalog(
            HttpServletRequest request,
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "maxUpkeep", required = false) String maxUpkeep) {
        // Signed-in owner catalogue includes only the DB-verified session's ownership,
        // while guest catalogue keeps the public NULL-actor source contract.
        UUID actor = verifiedMember(request).map(UserAuthService.SessionInfo::getUserId).orElse(null);
        return ResponseEntity.ok(shopService.getCatalog(actor, query, maxUpkeep));
    }

    @GetMapping("/public-catalog")
    @Operation(summary = "새 상점 UI 전용 공개 실제 DB 상품 조회, 방문자의 회원 소유정보 없음")
    public ResponseEntity<ShopCatalogListResponse> getPublicCatalog(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "maxUpkeep", required = false) String maxUpkeep) {
        return ResponseEntity.ok(shopService.getCatalog(null, query, maxUpkeep));
    }

    @GetMapping({"/inventory", "/my-items"})
    @Operation(summary = "인증된 본인 계정의 아이템 인벤토리")
    public ResponseEntity<?> getMyInventory(HttpServletRequest request) {
        var session = verifiedMember(request);
        if (session.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("code", "SESSION_REQUIRED"));
        return ResponseEntity.ok(shopService.getMyItems(session.get().getUserId().toString()));
    }

    @PostMapping("/purchase")
    @Operation(summary = "검증된 소유자 및 멱등 키 기반 아이템 구매")
    public ResponseEntity<?> purchaseItem(
            HttpServletRequest httpRequest,
            @RequestHeader(value="X-CSRF-Token", required=false) String csrf,
            @RequestHeader(value="Idempotency-Key", required=false) String idempotencyKey,
            @RequestBody(required=false) ShopPurchaseRequest request
    ) {
        var session = verifiedMember(httpRequest);
        if (session.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("code", "SESSION_REQUIRED"));
        if (!verifiedCsrf(session.get(), csrf)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("code", "CSRF_REQUIRED"));
        if (request == null || request.itemId() == null || request.itemId().isBlank())
            return ResponseEntity.badRequest().body(ShopPurchaseResponse.fail("ITEM_ID_REQUIRED"));
        UUID key;
        try { key = UUID.fromString(idempotencyKey); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ShopPurchaseResponse.fail("IDEMPOTENCY_KEY_REQUIRED")); }
        ShopPurchaseResponse response = shopService.purchaseItem(session.get().getUserId().toString(), request.itemId(), request.quantity(), key);
        return response.success() ? ResponseEntity.ok(response) :
                ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @GetMapping("/crafting/recipes")
    @Operation(summary = "장비 및 아이템 제작 레시피 목록 조회")
    public ResponseEntity<CraftingRecipesResponse> getCraftingRecipes() {
        return ResponseEntity.ok(shopService.getCraftingRecipes());
    }

    @PostMapping("/crafting/craft")
    @Operation(summary = "제작 원장 검증 대기")
    public ResponseEntity<?> executeCrafting(
            HttpServletRequest httpRequest,
            @RequestHeader(value="X-CSRF-Token",required=false) String csrf,
            @RequestBody(required=false) CraftExecuteRequest request
    ) {
        var session = verifiedMember(httpRequest);
        if (session.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("code", "SESSION_REQUIRED"));
        if (!verifiedCsrf(session.get(), csrf)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("code", "CSRF_REQUIRED"));
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(CraftExecuteResponse.fail("CRAFTING_LEDGER_NOT_VERIFIED"));
    }
}
