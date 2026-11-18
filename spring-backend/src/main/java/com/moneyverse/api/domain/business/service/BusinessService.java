package com.moneyverse.api.domain.business.service;

import com.moneyverse.api.domain.business.dto.BusinessDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class BusinessService {
    private static final Logger log = LoggerFactory.getLogger(BusinessService.class);
    private final JdbcClient jdbcClient;

    public BusinessService(JdbcClient jdbcClient) { this.jdbcClient = jdbcClient; }

    private UUID actor(String userId) {
        try { return UUID.fromString(userId); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED"); }
    }

    private ResponseStatusException unavailable(String source) {
        log.warn("Business source unavailable: {}", source);
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BUSINESS_SOURCE_UNAVAILABLE");
    }

    public BusinessCatalogResponse getCatalog() {
        try {
            List<BusinessCatalogItem> rows = jdbcClient.sql(
                    "SELECT id::text AS type_id, name, description, purchase_cost::text AS base_price, " +
                    "(daily_revenue - daily_operating_cost)::text AS daily_yield " +
                    "FROM public.business_catalog()")
                    .query((rs, n) -> new BusinessCatalogItem(
                            rs.getString("type_id"), rs.getString("name"), rs.getString("description"),
                            null, // source does not contain a category
                            rs.getString("base_price"), rs.getString("daily_yield"),
                            null)) // tier cap not available in authoritative source
                    .list();
            return new BusinessCatalogResponse(true, rows);
        } catch (Exception e) { throw unavailable("catalog"); }
    }

    public BusinessOwnershipListResponse getMyBusinesses(String userId) {
        UUID owner = actor(userId);
        try {
            List<BusinessOwnershipItem> rows = jdbcClient.sql(
                    "SELECT ownership_id::text AS business_id, business_type_id::text AS type_id, name, " +
                    "(daily_revenue - daily_operating_cost)::text AS daily_yield, " +
                    "last_settlement_date::text AS last_collected_at, purchased_at::text AS created_at " +
                    "FROM public.business_my_ownerships_v2(?::uuid)")
                    .param(owner)
                    .query((rs, n) -> new BusinessOwnershipItem(
                            rs.getString("business_id"), rs.getString("type_id"), rs.getString("name"),
                            null, // source has no separate type display name
                            null, // no canonical ownership tier in current function
                            rs.getString("daily_yield"),
                            null, // uncollected revenue is not an authoritative source column
                            rs.getString("last_collected_at"), rs.getString("created_at")))
                    .list();
            return new BusinessOwnershipListResponse(true, rows);
        } catch (Exception e) { throw unavailable("ownerships"); }
    }

    public BusinessPurchaseResponse purchaseBusiness(String userId, String typeId, String name) {
        return BusinessPurchaseResponse.fail("IDEMPOTENCY_KEY_REQUIRED");
    }

    public BusinessPurchaseResponse purchaseBusiness(String userId, String typeId, String name, UUID key) {
        if (key == null) return BusinessPurchaseResponse.fail("IDEMPOTENCY_KEY_REQUIRED");
        UUID owner = actor(userId);
        try {
            UUID businessType = UUID.fromString(typeId);
            return jdbcClient.sql("SELECT ownership_id::text, transaction_id::text FROM public.business_purchase(?::uuid, ?::uuid, ?::uuid)")
                    .param(key).param(owner).param(businessType)
                    .query((rs, n) -> {
                        String receipt = rs.getString("transaction_id");
                        String ownershipId = rs.getString("ownership_id");
                        return (receipt == null || ownershipId == null)
                                ? BusinessPurchaseResponse.fail("PURCHASE_RECEIPT_MISSING")
                                : BusinessPurchaseResponse.ok(ownershipId);
                    })
                    .optional().orElseGet(() -> BusinessPurchaseResponse.fail("PURCHASE_RECEIPT_MISSING"));
        } catch (Exception e) {
            log.warn("Business purchase could not produce an authoritative receipt");
            return BusinessPurchaseResponse.fail("PURCHASE_SOURCE_UNAVAILABLE");
        }
    }

    public BusinessCollectResponse collectRevenue(String userId, String businessId) {
        return BusinessCollectResponse.fail("SETTLEMENT_TAX_CONTRACT_NOT_VERIFIED");
    }

    public BusinessCollectResponse collectRevenue(String userId, String businessId, UUID key) {
        // The DB function exposes operating costs but not a separately verified tax receipt.
        // Do not advertise a 10% treasury tax transfer or perform an unchecked financial write.
        if (key == null) return BusinessCollectResponse.fail("IDEMPOTENCY_KEY_REQUIRED");
        actor(userId);
        try { UUID.fromString(businessId); }
        catch (Exception e) { return BusinessCollectResponse.fail("INVALID_OWNERSHIP_ID"); }
        return BusinessCollectResponse.fail("SETTLEMENT_TAX_CONTRACT_NOT_VERIFIED");
    }
}
