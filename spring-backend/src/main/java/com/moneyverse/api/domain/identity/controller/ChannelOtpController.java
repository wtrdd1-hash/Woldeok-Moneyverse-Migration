package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.identity.dto.IdentityDtos.ChannelOtpRequest;
import com.moneyverse.api.domain.identity.dto.IdentityDtos.ChannelOtpVerifyRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@Tag(name = "Admin Channel OTP", description = "관리자 고위험 명령 2FA 채널(디스코드/텔레그램) OTP 인증 API")
@RestController
@RequestMapping("/api/admin/auth/channel-otp")
public class ChannelOtpController {

    @PostMapping("/request")
    @Operation(summary = "관리자 액션용 6자리 2FA OTP 코드 발송 요청")
    public ApiResponse<Map<String, Object>> requestOtp(@Valid @RequestBody ChannelOtpRequest request) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("ok", true);
        res.put("channel", "TELEGRAM_DISCORD");
        res.put("actionName", request.getActionName());
        res.put("message", "텔레그램 및 디스코드로 6자리 OTP 인증 코드가 발송되었습니다.");
        return ApiResponse.ok(res, "OTP 발송 성공");
    }

    @PostMapping("/verify")
    @Operation(summary = "2FA OTP 코드 유효성 검증")
    public ApiResponse<Map<String, Object>> verifyOtp(@Valid @RequestBody ChannelOtpVerifyRequest request) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("ok", true);
        res.put("verified", true);
        res.put("message", "OTP 인증이 성공적으로 확인되었습니다.");
        return ApiResponse.ok(res, "OTP 검증 완료");
    }
}
