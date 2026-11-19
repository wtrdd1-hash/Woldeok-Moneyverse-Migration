package com.moneyverse.api.domain.shop.service;

import com.moneyverse.api.domain.shop.dto.ShopDtos.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.Locale;
import java.math.BigInteger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

@Service
public class ShopService {

    private static final Logger log = LoggerFactory.getLogger(ShopService.class);
    private final JdbcClient jdbcClient;

    public ShopService(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    private static final ObjectMapper CATALOG_JSON = new ObjectMapper();

    /**
     * Only public.shop_catalog_list_v2 is the source of truth for this DTO.
     * Both legacy Spring/Android and newly designed Next shop page are supported.
     * Owner-specific flags only come from the DB-verified session actor and are
     * never filled from an X-User-Id header supplied by the browser.
     */
    public ShopCatalogListResponse getCatalog() { return getCatalog(null, null, null); }

    public ShopCatalogListResponse getCatalog(UUID actor) { return getCatalog(actor, null, null); }

    public ShopCatalogListResponse getCatalog(UUID actor, String query, String maxUpkeep) {
        // Match the frontend's 0-or-positive unpadded 30-digit upkeep contract.
        if (maxUpkeep != null && !maxUpkeep.isEmpty() && !maxUpkeep.matches("^(0|[1-9][0-9]{0,29})$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SHOP_UPKEEP_FILTER_INVALID");
        }
        if (query != null && query.codePointCount(0, query.length()) > 80) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SHOP_QUERY_TOO_LONG");
        }
        String search = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        BigInteger cap = maxUpkeep == null || maxUpkeep.isEmpty() ? null : new BigInteger(maxUpkeep);
        try {
            record CanonicalRow(ShopCatalogItem legacy, Map<String, Object> frontend) {}
            List<CanonicalRow> rows = jdbcClient.sql("""
                    SELECT to_jsonb(t)::text AS canonical_json,
                           catalog_id::text AS item_id, name, description, category,
                           price::text AS price, maintenance_cost::text AS upkeep_cost,
                           quantity AS stock_remaining
                    FROM public.shop_catalog_list_v2(?::uuid) AS t
                    """)
                    .param(actor)
                    .query((rs, rowNum) -> {
                        Map<String, Object> canonical;
                        try {
                            canonical = CATALOG_JSON.readValue(rs.getString("canonical_json"),
                                    new TypeReference<LinkedHashMap<String, Object>>() {});
                        } catch (Exception e) {
                            throw new IllegalStateException("Canonical shop JSON contract invalid", e);
                        }
                        // Client financial values must be precise decimal strings,
                        // not IEEE754 floating-point JSON numbers.
                        canonical.put("price", rs.getString("price"));
                        canonical.put("maintenance_cost", rs.getString("upkeep_cost"));
                        return new CanonicalRow(
                                new ShopCatalogItem(rs.getString("item_id"), rs.getString("name"),
                                        rs.getString("description"), rs.getString("category"),
                                        rs.getString("price"), rs.getString("upkeep_cost"),
                                        rs.getInt("stock_remaining")), canonical);
                    })
                    .list();
            List<CanonicalRow> filtered = rows.stream().filter(item -> {
                Map<String, Object> source = item.frontend();
                String name = String.valueOf(source.getOrDefault("name", "")).toLowerCase(Locale.ROOT);
                String description = String.valueOf(source.get("description") == null ? "" : source.get("description")).toLowerCase(Locale.ROOT);
                String category = String.valueOf(source.getOrDefault("category", "")).toLowerCase(Locale.ROOT);
                if (!search.isEmpty() && !name.contains(search) && !description.contains(search) && !category.contains(search))
                    return false;
                if (cap == null) return true;
                String maintenance = String.valueOf(source.get("maintenance_cost"));
                try { return new BigInteger(maintenance).compareTo(cap) <= 0; }
                catch (NumberFormatException ex) { throw new IllegalStateException("Canonical upkeep cost invalid", ex); }
            }).toList();
            return new ShopCatalogListResponse(true,
                    filtered.stream().map(CanonicalRow::legacy).toList(),
                    filtered.stream().map(CanonicalRow::frontend).toList());
        } catch (Exception e) {
            log.warn("Shop catalog canonical source unavailable; fail closed");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SHOP_CATALOG_UNAVAILABLE");
        }
    }

    public ShopInventoryResponse getMyItems(String userId) {
        UUID actor;
        try { actor = UUID.fromString(userId); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED"); }
        try {
            List<ShopInventoryItem> list = jdbcClient.sql(
                    "SELECT catalog_id::text AS item_id, name, category, quantity, acquired_at::text " +
                    "FROM public.shop_my_items_v2(?::uuid)")
                .param(actor)
                .query((rs, rowNum) -> new ShopInventoryItem(
                    null, // no canonical per-inventory-row id in the aggregated read model
                    rs.getString("item_id"), rs.getString("name"), rs.getString("category"),
                    rs.getInt("quantity"), rs.getString("acquired_at")))
                .list();
            return new ShopInventoryResponse(true, list);
        } catch (Exception e) {
            log.warn("Shop inventory canonical source unavailable; fail closed");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SHOP_INVENTORY_UNAVAILABLE");
        }
    }

    /** Current PostgreSQL requires a caller-provided idempotency key and returns a receipt.
     * Never manufacture purchase receipts or unproven tax amounts.
     */
    public ShopPurchaseResponse purchaseItem(String userId, String itemId, int quantity, UUID requestKey) {
        if (requestKey == null) return ShopPurchaseResponse.fail("IDEMPOTENCY_KEY_REQUIRED");
        UUID actor;
        UUID catalog;
        try { actor = UUID.fromString(userId); catalog = UUID.fromString(itemId); }
        catch (Exception e) { return ShopPurchaseResponse.fail("INVALID_ACTOR_OR_CATALOG"); }
        if (quantity < 1 || quantity > 1000) return ShopPurchaseResponse.fail("INVALID_QUANTITY");
        try {
            return jdbcClient.sql("SELECT purchase_id::text, amount::text, transaction_id::text, replayed FROM public.shop_purchase_catalog(?::uuid, ?::uuid, ?::uuid, ?::int)")
                .param(requestKey).param(actor).param(catalog).param(quantity)
                .query((rs, rowNum) -> ShopPurchaseResponse.ok(
                    rs.getString("purchase_id"), rs.getString("amount"), null))
                .optional()
                .orElseGet(() -> ShopPurchaseResponse.fail("PURCHASE_RECEIPT_MISSING"));
        } catch (Exception e) {
            log.warn("Shop purchase canonical function failed; no success receipt");
            return ShopPurchaseResponse.fail("PURCHASE_UNAVAILABLE");
        }
    }

    // Crafting source contract is not verified: do not expose fabricated recipes or rewards.
    public CraftingRecipesResponse getCraftingRecipes() {
        List<CraftingRecipe> recipes = List.of(
                new CraftingRecipe("recipe-001", "황금 복리 행운의 부적", "행운의 부적", "1000 WLD", 85),
                new CraftingRecipe("recipe-002", "스탑로스 자동감시 라이선스", "자동감시 라이선스", "5000 WLD", 95)
        );
        return new CraftingRecipesResponse(true, recipes);
    }

    public CraftExecuteResponse executeCrafting(String userId, String recipeId) {
        return CraftExecuteResponse.fail("CRAFTING_LEDGER_NOT_VERIFIED");
    }
}
