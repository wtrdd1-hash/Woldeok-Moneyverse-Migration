package com.moneyverse.api.domain.business.controller;

import com.moneyverse.api.domain.business.dto.BusinessDtos.*;
import com.moneyverse.api.domain.business.service.BusinessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Business & Enterprises", description = "사업장 창업, 지분 보유, 일일 정산 및 10% 법인세 납입 API")
@RestController
@RequestMapping({"/api/business", "/api/v1/business"})
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    private String resolveUserId(String xUserId, String xActorUserId) {
        if (xUserId != null && !xUserId.isBlank()) return xUserId.trim();
        if (xActorUserId != null && !xActorUserId.isBlank()) return xActorUserId.trim();
        return "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
    }

    @GetMapping("/catalog")
    @Operation(summary = "설립 가능한 사업장 업종 카탈로그 조회")
    public ResponseEntity<BusinessCatalogResponse> getCatalog() {
        return ResponseEntity.ok(businessService.getCatalog());
    }

    @GetMapping({"", "/", "/my"})
    @Operation(summary = "내가 소유한 사업장 목록 및 미수령 영업수익 조회")
    public ResponseEntity<BusinessOwnershipListResponse> getMyBusinesses(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        String userId = resolveUserId(xUserId, xActorUserId);
        return ResponseEntity.ok(businessService.getMyBusinesses(userId));
    }

    @PostMapping("/purchase")
    @Operation(summary = "신규 사업장 설립 및 영업권 취득")
    public ResponseEntity<BusinessPurchaseResponse> purchaseBusiness(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId,
            @RequestBody BusinessPurchaseRequest request
    ) {
        String userId = resolveUserId(xUserId, xActorUserId);
        if (request == null || request.typeId() == null || request.typeId().isBlank()) {
            return ResponseEntity.badRequest().body(BusinessPurchaseResponse.fail("type_id is required"));
        }
        String name = (request.name() != null && !request.name().isBlank()) ? request.name() : "신규 사업장";
        BusinessPurchaseResponse response = businessService.purchaseBusiness(userId, request.typeId(), name);
        return response.success() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/collect")
    @Operation(summary = "사업장 영업수익금 수령 및 10% 법인세 국고 자동 원천징수")
    public ResponseEntity<BusinessCollectResponse> collectRevenue(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId,
            @RequestBody BusinessCollectRequest request
    ) {
        String userId = resolveUserId(xUserId, xActorUserId);
        if (request == null || request.businessId() == null || request.businessId().isBlank()) {
            return ResponseEntity.badRequest().body(BusinessCollectResponse.fail("business_id is required"));
        }
        BusinessCollectResponse response = businessService.collectRevenue(userId, request.businessId());
        return response.success() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }
}
