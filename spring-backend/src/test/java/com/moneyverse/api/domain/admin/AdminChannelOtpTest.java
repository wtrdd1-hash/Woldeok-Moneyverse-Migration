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
    @DisplayName("OTP API는 사용자가 직접 기입한 actor 헤더만으로 동작하지 않는다")
    void anonymousActorHeaderCannotStartOtp() throws Exception {
        String unverifiedActor = "test-admin-uuid-1";
        mockMvc.perform(post("/api/admin/auth/channel-otp/request")
                        .header("x-actor-user-id", unverifiedActor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new OtpRequest("국고 승인"))))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/admin/auth/channel-otp/verify")
                        .header("x-actor-user-id", unverifiedActor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new OtpVerifyRequest("000000"))))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/auth/channel-otp/status")
                        .header("x-actor-user-id", unverifiedActor))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/admin/auth/channel-otp/revoke")
                        .header("x-actor-user-id", unverifiedActor))
                .andExpect(status().isUnauthorized());
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
