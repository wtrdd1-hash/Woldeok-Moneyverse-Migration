package com.moneyverse.api.domain.treasury.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.MintTopupRequest;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.SalaryDisburseRequest;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
                .build());
        vaultRepository.save(TreasuryVault.builder()
                .code("VAULT_RESERVE")
                .name("지급준비금 특별 금고")
                .balanceWld("2000000")
                .build());
        vaultRepository.save(TreasuryVault.builder()
                .code("VAULT_SWF")
                .name("국부펀드(ASWF) 투자 자산 금고")
                .balanceWld("3000000")
                .build());
    }

    @Test
    @DisplayName("국고 총괄 현황 /api/v1/admin/treasury/overview 정상 조회")
    void getOverviewSucceeds() throws Exception {
        mockMvc.perform(get("/api/v1/admin/treasury/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vaults").isArray())
                .andExpect(jsonPath("$.total_treasury_wld").value("10000000"))
                .andExpect(jsonPath("$.available_wld").value("5000000"));
    }

    @Test
    @DisplayName("조폐국 충전 /api/v1/admin/treasury/mint-topup 호출 시 정본 원장 부재로 503이며 잔액이 유지된다")
    void mintTopupFailsClosedWithoutLedger() throws Exception {
        MintTopupRequest request = MintTopupRequest.builder()
                .amountWld(1000000L)
                .reason("비상 통화공급 테스트")
                .otpCode("123456")
                .build();

        mockMvc.perform(post("/api/v1/admin/treasury/mint-topup")
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
    @DisplayName("국부펀드 리밸런싱 /api/v1/admin/treasury/swf/rebalance 호출 시 원장 부재로 503이다")
    void swfRebalanceFailsClosedWithoutLedger() throws Exception {
        mockMvc.perform(post("/api/v1/admin/treasury/swf/rebalance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isServiceUnavailable());
    }
}
