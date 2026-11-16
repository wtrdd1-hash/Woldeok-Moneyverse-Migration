package com.moneyverse.api.domain.shop.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/admin/shop",
        "/api/admin/shop",
        "/admin/shop"
})
public class AdminShopController {

    private final UserAuthService userAuthService;

    @Autowired
    public AdminShopController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    private void verifyAdmin(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        List<String> roles = sessionOpt.get().getRoles();
        boolean hasAdmin = roles != null && roles.stream().anyMatch(r -> "SUPERADMIN".equalsIgnoreCase(r) || "ADMIN".equalsIgnoreCase(r));
        if (!hasAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Admin access required");
        }
    }

    @GetMapping("/items")
    public ResponseEntity<Map<String, Object>> listAdminItems(
            HttpServletRequest request,
            @RequestParam(name = "category", required = false) String category) {
        verifyAdmin(request);
        List<Map<String, Object>> items = List.of(
                Map.of(
                        "id", "item-gold-pass",
                        "code", "PASS_GOLD_MONTHLY",
                        "name", "월간 골드 멤버십 패스",
                        "category", "PASS",
                        "basePrice", "150000",
                        "rarity", "EPIC",
                        "isLimited", false,
                        "currentStock", 99999
                ),
                Map.of(
                        "id", "item-custom-title",
                        "code", "TITLE_SPECIAL_TYCOON",
                        "name", "한정 칭호: 전설의 대부호",
                        "category", "TITLE",
                        "basePrice", "500000",
                        "rarity", "LEGENDARY",
                        "isLimited", true,
                        "currentStock", 42
                )
        );
        return ResponseEntity.ok(Map.of("items", items, "total", items.size()));
    }

    @PostMapping("/items")
    public ResponseEntity<Map<String, Object>> createItem(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        verifyAdmin(request);
        if (body == null || !body.containsKey("name") || !body.containsKey("basePrice")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name and basePrice are required");
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("id", "item-" + UUID.randomUUID());
        res.put("name", body.get("name"));
        res.put("basePrice", body.get("basePrice"));
        res.put("createdAt", new Date().toInstant().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PatchMapping("/items/{id}")
    public ResponseEntity<Map<String, Object>> updateItem(
            HttpServletRequest request,
            @PathVariable("id") String id,
            @RequestBody(required = false) Map<String, Object> body) {
        verifyAdmin(request);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("id", id);
        res.put("updatedFields", body != null ? body.keySet() : Collections.emptySet());
        res.put("updatedAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Map<String, Object>> deleteItem(
            HttpServletRequest request,
            @PathVariable("id") String id) {
        verifyAdmin(request);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("deletedId", id);
        res.put("deletedAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }
}
