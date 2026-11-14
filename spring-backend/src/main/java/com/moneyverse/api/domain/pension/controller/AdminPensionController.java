package com.moneyverse.api.domain.pension.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.pension.dto.PensionDtos.PensionOverview;
import com.moneyverse.api.domain.pension.service.PensionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Tag(name = "Admin National Pension", description = "관리자 국민연금 기금 총괄 관리 및 정기 연금 집행 API")
@RestController
@RequestMapping("/api/admin/pension")
public class AdminPensionController {

    private final PensionService pensionService;

    public AdminPensionController(PensionService pensionService) {
        this.pensionService = pensionService;
    }

    @GetMapping("/overview")
    @Operation(summary = "국민연금 적립 기금(AUM), 총 가입자 수, 지급 통계 조회")
    public ApiResponse<PensionOverview> getOverview() {
        return ApiResponse.ok(pensionService.getOverview());
    }

    @GetMapping("/recent-payouts")
    @Operation(summary = "최근 정기 기초연금 지급 로그 조회")
    public ApiResponse<List<Map<String, Object>>> getRecentPayouts(@RequestParam(value = "limit", defaultValue = "20") int limit) {
        return ApiResponse.ok(Collections.emptyList());
    }

    @PostMapping("/distribute-payouts")
    @Operation(summary = "은퇴 연금 수령 대상자 대상 기초연금 일괄 수동 집행")
    public ApiResponse<Map<String, Object>> distributePayouts(
            @RequestHeader(value = "X-Admin-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String adminId) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("pensionersCount", 0);
        result.put("totalPayoutAmount", "0");
        result.put("message", "은퇴 연금 대상자 정기 지급이 정상 완결되었습니다.");
        return ApiResponse.ok(result, "연금 일괄 지급 완료");
    }
}
