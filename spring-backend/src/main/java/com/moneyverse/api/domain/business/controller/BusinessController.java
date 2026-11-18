package com.moneyverse.api.domain.business.controller;

import com.moneyverse.api.domain.business.dto.BusinessDtos.*;
import com.moneyverse.api.domain.business.service.BusinessService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@Tag(name = "Business & Enterprises", description = "Canonical business reads and owner-scoped receipts")
@RestController
@RequestMapping({"/api/business", "/api/v1/business"})
public class BusinessController {
    private final BusinessService businessService;
    private final MemberApiGuard memberApiGuard;

    public BusinessController(BusinessService businessService, MemberApiGuard memberApiGuard) {
        this.businessService = businessService;
        this.memberApiGuard = memberApiGuard;
    }

    @GetMapping("/catalog")
    @Operation(summary = "Canonical public business catalog")
    public ResponseEntity<BusinessCatalogResponse> getCatalog() {
        return ResponseEntity.ok(businessService.getCatalog());
    }

    @GetMapping({"", "/", "/my"})
    @Operation(summary = "Authenticated owner's business holdings")
    public ResponseEntity<BusinessOwnershipListResponse> getMyBusinesses(HttpServletRequest request) {
        return ResponseEntity.ok(businessService.getMyBusinesses(memberApiGuard.actor(request).toString()));
    }

    @PostMapping("/purchase")
    @Operation(summary = "Purchase with verified owner, CSRF, idempotency and canonical receipt")
    public ResponseEntity<BusinessPurchaseResponse> purchaseBusiness(HttpServletRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String keyHeader,
            @RequestBody(required = false) BusinessPurchaseRequest body) {
        UUID owner = memberApiGuard.verifiedMutationActor(request);
        UUID key = memberApiGuard.idempotencyKey(keyHeader);
        if (body == null || body.typeId() == null || body.typeId().isBlank()) {
            return ResponseEntity.badRequest().body(BusinessPurchaseResponse.fail("TYPE_ID_REQUIRED"));
        }
        var response = businessService.purchaseBusiness(owner.toString(), body.typeId(), body.name(), key);
        return response.success() ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @PostMapping("/collect")
    @Operation(summary = "Blocked until canonical settlement tax receipt is certified")
    public ResponseEntity<BusinessCollectResponse> collectRevenue(HttpServletRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String keyHeader,
            @RequestBody(required = false) BusinessCollectRequest body) {
        UUID owner = memberApiGuard.verifiedMutationActor(request);
        UUID key = memberApiGuard.idempotencyKey(keyHeader);
        if (body == null || body.businessId() == null || body.businessId().isBlank()) {
            return ResponseEntity.badRequest().body(BusinessCollectResponse.fail("BUSINESS_ID_REQUIRED"));
        }
        var response = businessService.collectRevenue(owner.toString(), body.businessId(), key);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}
