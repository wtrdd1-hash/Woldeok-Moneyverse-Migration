package com.moneyverse.api.domain.shop.service;

import com.moneyverse.api.domain.shop.dto.ShopDtos.*;
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

    /** Public catalogue is read from the canonical source; never invented on DB failure. */
    public ShopCatalogListResponse getCatalog() {
        try {
            List<ShopCatalogItem> items = jdbcClient.sql(
                 "SELECT catalog_id::text AS item_id, name, description, category, price::text, " +
                 "maintenance_cost::text AS upkeep_cost, quantity AS stock_remaining " +
                 "FROM public.shop_catalog_list_v2(NULL::uuid)")
                .query((rs, rowNum) -> new ShopCatalogItem(
                    rs.getString("item_id"), rs.getString("name"), rs.getString("description"),
                    rs.getString("category"), rs.getString("price"), rs.getString("upkeep_cost"),
                    rs.getInt("stock_remaining")))
                .list();
            return new ShopCatalogListResponse(true, items);
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
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "CRAFTING_SOURCE_NOT_VERIFIED");
    }

    public CraftExecuteResponse executeCrafting(String userId, String recipeId) {
        return CraftExecuteResponse.fail("CRAFTING_LEDGER_NOT_VERIFIED");
    }
}
