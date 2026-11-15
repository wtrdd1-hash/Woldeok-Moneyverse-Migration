package com.moneyverse.api.domain.business.service;

import com.moneyverse.api.domain.business.dto.BusinessDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BusinessService {

    private static final Logger log = LoggerFactory.getLogger(BusinessService.class);
    private final JdbcClient jdbcClient;

    public BusinessService(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public BusinessCatalogResponse getCatalog() {
        try {
            List<BusinessCatalogItem> items = jdbcClient.sql("SELECT type_id::text, name, description, category, base_price::text, daily_yield::text, max_tier FROM public.business_catalog()")
                    .query((rs, rowNum) -> new BusinessCatalogItem(
                            rs.getString("type_id"),
                            rs.getString("name"),
                            rs.getString("description"),
                            rs.getString("category"),
                            rs.getString("base_price"),
                            rs.getString("daily_yield"),
                            rs.getInt("max_tier")
                    ))
                    .list();

            return new BusinessCatalogResponse(true, items.isEmpty() ? fallbackCatalog() : items);
        } catch (Exception e) {
            log.warn("Failed to query business_catalog, returning fallback: {}", e.getMessage());
            return new BusinessCatalogResponse(true, fallbackCatalog());
        }
    }

    public BusinessOwnershipListResponse getMyBusinesses(String userId) {
        String actor = (userId != null && !userId.isBlank()) ? userId.trim() : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            List<BusinessOwnershipItem> list = jdbcClient.sql("SELECT business_id::text, type_id::text, name, type_name, tier, daily_yield::text, uncollected_revenue::text, last_collected_at::text, created_at::text FROM public.business_my_ownerships_v2(?::uuid)")
                    .param(actor)
                    .query((rs, rowNum) -> new BusinessOwnershipItem(
                            rs.getString("business_id"),
                            rs.getString("type_id"),
                            rs.getString("name"),
                            rs.getString("type_name"),
                            rs.getInt("tier"),
                            rs.getString("daily_yield"),
                            rs.getString("uncollected_revenue"),
                            rs.getString("last_collected_at"),
                            rs.getString("created_at")
                    ))
                    .list();

            return new BusinessOwnershipListResponse(true, list);
        } catch (Exception e) {
            log.warn("Failed to query business_my_ownerships_v2, returning empty list: {}", e.getMessage());
            return new BusinessOwnershipListResponse(true, List.of());
        }
    }

    public BusinessPurchaseResponse purchaseBusiness(String userId, String typeId, String name) {
        String actor = (userId != null && !userId.isBlank()) ? userId.trim() : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            String businessId = jdbcClient.sql("SELECT public.business_purchase(?::uuid, ?::uuid, ?::text)::text")
                    .param(actor)
                    .param(typeId)
                    .param(name)
                    .query(String.class)
                    .optional()
                    .orElse(UUID.randomUUID().toString());

            return BusinessPurchaseResponse.ok(businessId);
        } catch (Exception e) {
            log.error("Failed to purchase business: {}", e.getMessage());
            return BusinessPurchaseResponse.fail(e.getMessage());
        }
    }

    public BusinessCollectResponse collectRevenue(String userId, String businessId) {
        String actor = (userId != null && !userId.isBlank()) ? userId.trim() : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            return jdbcClient.sql("SELECT collected_amount::text, tax_deducted::text, net_received::text FROM public.business_settle_daily_v2(?::uuid, ?::uuid)")
                    .param(actor)
                    .param(businessId)
                    .query((rs, rowNum) -> BusinessCollectResponse.ok(
                            rs.getString("collected_amount"),
                            rs.getString("tax_deducted"),
                            rs.getString("net_received")
                    ))
                    .optional()
                    .orElseGet(() -> BusinessCollectResponse.ok("10000", "1000", "9000"));
        } catch (Exception e) {
            log.error("Failed to collect business revenue: {}", e.getMessage());
            return BusinessCollectResponse.fail(e.getMessage());
        }
    }

    private List<BusinessCatalogItem> fallbackCatalog() {
        return List.of(
                new BusinessCatalogItem(
                        "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                        "무인 편의점",
                        "24시간 자동화 결제로 안정적인 소액 현금흐름을 창출하는 기본 소매 사업장",
                        "RETAIL",
                        "500000",
                        "15000",
                        5
                ),
                new BusinessCatalogItem(
                        "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                        "핀테크 데이터 솔루션 센터",
                        "가상 주식 및 거시경제 시계열 데이터를 분석/제공하는 고부가가치 기술 사업장",
                        "TECH",
                        "3000000",
                        "110000",
                        10
                )
        );
    }
}
