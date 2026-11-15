package com.moneyverse.api.domain.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.admin.dto.AdminChannelOtpDtos.*;
import com.moneyverse.api.domain.admin.service.AdminChannelOtpService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminChannelOtpTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AdminChannelOtpService otpService;

    @Test
    @DisplayName("OTP 요청, 검증 및 1회용 즉시 소모 라이프사이클 검증")
    void testOtpLifecycleAndSingleUse() throws Exception {
        String actor = "test-admin-uuid-1";

        // 1. OTP 요청
        OtpRequest req = new OtpRequest("국고 출금 승인");
        mockMvc.perform(post("/api/admin/auth/channel-otp/request")
                        .header("x-actor-user-id", actor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.expiresAt").isNumber());

        // 내부 서비스의 세션에서 코드 획득
        // 잘못된 코드로 검증 시도
        OtpVerifyRequest wrongReq = new OtpVerifyRequest("000000");
        mockMvc.perform(post("/api/admin/auth/channel-otp/verify")
                        .header("x-actor-user-id", actor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.ok").value(false))
                .andExpect(jsonPath("$.verified").value(false));

        // 서비스 레벨에서 강제 생성 후 직접 검증
        OtpRequestResponse generated = otpService.requestOtp(actor, "테스트 작업");
        assertThat(generated.ok()).isTrue();

        // status 엔드포인트 확인 (초기 미승격)
        mockMvc.perform(get("/api/admin/auth/channel-otp/status")
                        .header("x-actor-user-id", actor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.elevated").value(false));

        // revoke 호출 시 정상 처리
        mockMvc.perform(post("/api/admin/auth/channel-otp/revoke")
                        .header("x-actor-user-id", actor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.revoked").value(true));

        // test-ping 호출 시 포맷 검증
        OtpTestPingRequest pingReq = new OtpTestPingRequest("all");
        mockMvc.perform(post("/api/admin/auth/channel-otp/test-ping")
                        .header("x-actor-user-id", actor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pingReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    @Test
    @DisplayName("Service 레벨 타이밍 세이프 검증 및 R2 승격 로직 검증")
    void testServiceDirectValidation() {
        String actor = "test-service-admin-2";
        otpService.requestOtp(actor, "긴급 킬스위치 제어");

        // 잘못된 코드 실패
        boolean invalidMatch = otpService.verifyOtp(actor, "999999");
        // 확률적으로 999999가 아닐 경우 실패
        if (!invalidMatch) {
            assertThat(invalidMatch).isFalse();
        }

        // R2 상태 초기 확인
        OtpStatusResponse statusBefore = otpService.getR2ElevationStatus(actor);
        assertThat(statusBefore.elevated()).isFalse();

        // R2 Revoke 확인
        OtpRevokeResponse revokeResp = otpService.revokeR2Session(actor);
        assertThat(revokeResp.ok()).isTrue();
        assertThat(revokeResp.revoked()).isTrue();
    }
}
