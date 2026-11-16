package com.moneyverse.api.domain.treasury.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.*;
import com.moneyverse.api.domain.treasury.model.TreasuryVault;
import com.moneyverse.api.domain.treasury.repository.TreasuryVaultRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TreasuryAdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TreasuryVaultRepository vaultRepository;

    @BeforeEach
    void setUp() {
        vaultRepository.deleteAll();
        vaultRepository.save(TreasuryVault.builder()
                .code("VAULT_MAIN")
                .name("중앙 국고 주 금고")
                .balanceWld("5000000")
                .description("중앙 국고 주 금고")
                .build());
    }

    @Test
    @DisplayName("표준 경로 /api/v1/admin/treasury/mint-topup 호출 시 정본 원장 부재로 503이며 국고 잔액이 유지된다")
    void mintTopupCanonicalPathFailsClosedWithoutLedger() throws Exception {
        MintTopupRequest request = MintTopupRequest.builder()
                .amountWld(1000000L)
                .reason("통화정책 위원회 승인 국고 비상 유동성 즉시 보충")
                .otpCode("937482")
                .build();

        mockMvc.perform(post("/api/v1/admin/treasury/mint-topup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isServiceUnavailable());
        assertEquals("5000000", vaultRepository.findAll().get(0).getBalanceWld());
    }

    @Test
    @DisplayName("프론트엔드 직접 경로 /api/admin/treasury/mint-topup 호출 시에도 정본 원장 부재로 503을 반환한다")
    void mintTopupFrontendDirectPathFailsClosedWithoutLedger() throws Exception {
        MintTopupRequest request = MintTopupRequest.builder()
                .amountWld(1000000L)
                .reason("통화정책 위원회 승인 국고 비상 유동성 즉시 보충")
                .otpCode("937482")
                .build();

        mockMvc.perform(post("/api/admin/treasury/mint-topup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isServiceUnavailable());
        assertEquals("5000000", vaultRepository.findAll().get(0).getBalanceWld());
    }

    @Test
    @DisplayName("레거시 호환 경로 /api/treasury/mint-topup 호출 시에도 정본 원장 부재로 503을 반환한다")
    void mintTopupLegacyPathFailsClosedWithoutLedger() throws Exception {
        MintTopupRequest request = MintTopupRequest.builder()
                .amountWld(500000L)
                .reason("레거시 호환 긴급 국고 보충")
                .build();

        mockMvc.perform(post("/api/treasury/mint-topup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isServiceUnavailable());
        assertEquals("5000000", vaultRepository.findAll().get(0).getBalanceWld());
    }

    @Test
    @DisplayName("관리자 임금 지급 /api/v1/admin/treasury/salary/disburse 호출 시 정본 원장 부재로 503이며 잔액이 유지된다")
    void salaryDisburseFailsClosedWithoutLedger() throws Exception {
        SalaryDisburseRequest request = SalaryDisburseRequest.builder()
                .amountWld(50000L)
                .otpCode("123456")
                .build();

        mockMvc.perform(post("/api/v1/admin/treasury/salary/disburse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isServiceUnavailable());
        assertEquals("5000000", vaultRepository.findAll().get(0).getBalanceWld());
    }

    @Test
    @DisplayName("국부펀드 리밸런싱 /api/v1/admin/treasury/swf/rebalance 호출 시 executed: true가 반환된다")
    void swfRebalanceSucceeds() throws Exception {
        mockMvc.perform(post("/api/v1/admin/treasury/swf/rebalance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.executed").value(true))
                .andExpect(jsonPath("$.data.reason").value("SWF_REBALANCED_AND_RECONCILED"));
    }
}
