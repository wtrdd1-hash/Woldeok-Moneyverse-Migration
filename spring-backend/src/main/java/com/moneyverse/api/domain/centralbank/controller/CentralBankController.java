package com.moneyverse.api.domain.centralbank.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.centralbank.dto.CentralBankDtos.*;
import com.moneyverse.api.domain.centralbank.service.CentralBankService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Central Bank", description = "以묒븰????듯솕??吏??諛?湲곗?湲덈━/吏湲됱?鍮꾩쑉 ?뺤콉 API")
@RestController
@RequestMapping("/api/central-bank")
public class CentralBankController {

    private final CentralBankService centralBankService;

    public CentralBankController(CentralBankService centralBankService) {
        this.centralBankService = centralBankService;
    }

    @GetMapping({"/monetary-aggregates", "/aggregates"})
    @Operation(summary = "M0(蹂몄썝?듯솕), M1(?묒쓽?듯솕), M2(愿묒쓽?듯솕) 嫄곗떆寃쎌젣 ?듯솕??諛??듯솕?뱀닔 議고쉶")
    public ApiResponse<MonetaryAggregates> getMonetaryAggregates() {
        return ApiResponse.ok(centralBankService.getMonetaryAggregates());
    }

    @GetMapping("/base-rate")
    @Operation(summary = "?꾩옱 援?? 湲곗?湲덈━(Base Rate) 諛??뚯씪??猷?異붿젙 湲덈━ 議고쉶")
    public ApiResponse<Map<String, Object>> getBaseRate() {
        return ApiResponse.ok(centralBankService.getBaseRate());
    }

    @PutMapping("/base-rate")
    @Operation(summary = "援?? 湲곗?湲덈━(Base Rate) 寃곗젙 諛?怨듭떆 (湲덉쑖?듯솕?꾩썝??")
    public ApiResponse<Map<String, Object>> updateBaseRate(
            @RequestHeader(value = "X-Admin-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String adminId,
            @Valid @RequestBody UpdateBaseRateRequest request) {
        Map<String, Object> result = centralBankService.updateBaseRate(request.getBaseRateBps(), request.getReason(), adminId);
        return ApiResponse.ok(result, (String) result.get("message"));
    }

    @GetMapping("/reserve-requirement")
    @Operation(summary = "?쒖쨷 ?곸뾽???踰뺤젙 吏湲됱?鍮꾩쑉(Reserve Requirement Ratio) 議고쉶")
    public ApiResponse<Map<String, Object>> getReserveRequirement() {
        return ApiResponse.ok(centralBankService.getReserveRequirement());
    }

    @PutMapping("/reserve-requirement")
    @Operation(summary = "?쒖쨷 ?곸뾽???踰뺤젙 吏湲됱?鍮꾩쑉 媛깆떊 諛?怨듭떆")
    public ApiResponse<Map<String, Object>> updateReserveRequirement(
            @RequestHeader(value = "X-Admin-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String adminId,
            @Valid @RequestBody UpdateReserveRequirementRequest request) {
        Map<String, Object> result = centralBankService.updateReserveRequirement(request.getReserveRatioBps(), request.getReason(), adminId);
        return ApiResponse.ok(result, (String) result.get("message"));
    }
}

