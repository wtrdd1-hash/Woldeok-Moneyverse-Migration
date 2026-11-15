package com.moneyverse.api.domain.business.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.util.List;

public final class BusinessDtos {

    private BusinessDtos() {}

    public record BusinessCatalogItem(
            @JsonProperty("type_id") String typeId,
            @JsonProperty("name") String name,
            @JsonProperty("description") String description,
            @JsonProperty("category") String category,
            @JsonProperty("base_price") String basePrice,
            @JsonProperty("daily_yield") String dailyYield,
            @JsonProperty("max_tier") int maxTier
    ) implements Serializable {}

    public record BusinessCatalogResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("catalog") List<BusinessCatalogItem> catalog
    ) implements Serializable {}

    public record BusinessOwnershipItem(
            @JsonProperty("business_id") String businessId,
            @JsonProperty("type_id") String typeId,
            @JsonProperty("name") String name,
            @JsonProperty("type_name") String typeName,
            @JsonProperty("tier") int tier,
            @JsonProperty("daily_yield") String dailyYield,
            @JsonProperty("uncollected_revenue") String uncollectedRevenue,
            @JsonProperty("last_collected_at") String lastCollectedAt,
            @JsonProperty("created_at") String createdAt
    ) implements Serializable {}

    public record BusinessOwnershipListResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("businesses") List<BusinessOwnershipItem> businesses
    ) implements Serializable {}

    public record BusinessPurchaseRequest(
            @JsonProperty("type_id") String typeId,
            @JsonProperty("name") String name
    ) implements Serializable {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record BusinessPurchaseResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("business_id") String businessId,
            @JsonProperty("message") String message,
            @JsonProperty("error") String error
    ) implements Serializable {
        public static BusinessPurchaseResponse ok(String businessId) {
            return new BusinessPurchaseResponse(true, businessId, "사업장이 성공적으로 설립되었습니다.", null);
        }
        public static BusinessPurchaseResponse fail(String error) {
            return new BusinessPurchaseResponse(false, null, null, error);
        }
    }

    public record BusinessCollectRequest(
            @JsonProperty("business_id") String businessId
    ) implements Serializable {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record BusinessCollectResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("collected_amount") String collectedAmount,
            @JsonProperty("tax_deducted") String taxDeducted,
            @JsonProperty("net_received") String netReceived,
            @JsonProperty("message") String message,
            @JsonProperty("error") String error
    ) implements Serializable {
        public static BusinessCollectResponse ok(String collected, String tax, String net) {
            return new BusinessCollectResponse(true, collected, tax, net, "사업장 수익금 정산 및 법인세(10%) 자동 원천징수가 완료되었습니다.", null);
        }
        public static BusinessCollectResponse fail(String error) {
            return new BusinessCollectResponse(false, "0", "0", "0", null, error);
        }
    }
}
