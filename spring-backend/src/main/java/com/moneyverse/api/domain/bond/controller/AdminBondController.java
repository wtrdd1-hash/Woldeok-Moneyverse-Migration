package com.moneyverse.api.domain.bond.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.bond.dto.BondDtos.*;
import com.moneyverse.api.domain.bond.service.BondService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Tag(name = "Admin Treasury Bonds", description = "관리자 가상 국채 종목 발행 및 부채 지표 관리 API")
@RestController
@RequestMapping("/api/admin/bonds")
public class AdminBondController {

    private final BondService bondService;

    public AdminBondController(BondService bondService) {
        this.bondService = bondService;
    }

    @GetMapping("/overview")
    @Operation(summary = "국채 발행 잔액, 조달 총액, 가중평균 금리 지표 조회")
    public ApiResponse<BondOverview> getOverview() {
        return ApiResponse.ok(bondService.getOverview());
    }

    @GetMapping("/list")
    @Operation(summary = "발행 국채 전체 목록 및 상태 조회")
    public ApiResponse<List<BondItem>> listBonds() {
        return ApiResponse.ok(bondService.listBonds());
    }
}
