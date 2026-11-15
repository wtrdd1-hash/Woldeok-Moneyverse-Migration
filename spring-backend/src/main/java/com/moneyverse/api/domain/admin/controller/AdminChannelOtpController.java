package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.dto.AdminChannelOtpDtos.*;
import com.moneyverse.api.domain.admin.service.AdminChannelOtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/admin/auth/channel-otp", "/api/v1/admin/auth/channel-otp"})
public class AdminChannelOtpController {

    private final AdminChannelOtpService otpService;

    public AdminChannelOtpController(AdminChannelOtpService otpService) {
        this.otpService = otpService;
    }

    private String resolveActor(String actorHeader, String userHeader) {
        if (actorHeader != null && !actorHeader.isBlank()) return actorHeader.trim();
        if (userHeader != null && !userHeader.isBlank()) return userHeader.trim();
        return "admin-operator";
    }

    @PostMapping("/request")
    public ResponseEntity<OtpRequestResponse> requestOtp(
            @RequestHeader(value = "x-actor-user-id", required = false) String actorHeader,
            @RequestHeader(value = "x-user-id", required = false) String userHeader,
            @RequestBody(required = false) OtpRequest request
    ) {
        String actor = resolveActor(actorHeader, userHeader);
        String actionName = (request != null && request.actionName() != null) ? request.actionName() : "국고/연금 관리자 권한 승인";
        OtpRequestResponse response = otpService.requestOtp(actor, actionName);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<OtpVerifyResponse> verifyOtp(
            @RequestHeader(value = "x-actor-user-id", required = false) String actorHeader,
            @RequestHeader(value = "x-user-id", required = false) String userHeader,
            @RequestBody(required = false) OtpVerifyRequest request
    ) {
        String actor = resolveActor(actorHeader, userHeader);
        if (request == null || request.otpCode() == null || request.otpCode().isBlank()) {
            return ResponseEntity.badRequest().body(OtpVerifyResponse.failure("otpCode is required"));
        }

        boolean verified = otpService.verifyOtp(actor, request.otpCode());
        if (!verified) {
            return ResponseEntity.status(401).body(OtpVerifyResponse.failure("OTP 코드가 일치하지 않거나 만료되었습니다."));
        }

        return ResponseEntity.ok(OtpVerifyResponse.success());
    }

    @PostMapping("/elevate")
    public ResponseEntity<OtpElevateResponse> elevate(
            @RequestHeader(value = "x-actor-user-id", required = false) String actorHeader,
            @RequestHeader(value = "x-user-id", required = false) String userHeader,
            @RequestBody(required = false) OtpVerifyRequest request
    ) {
        String actor = resolveActor(actorHeader, userHeader);
        if (request == null || request.otpCode() == null || request.otpCode().isBlank()) {
            return ResponseEntity.badRequest().body(OtpElevateResponse.failure("otpCode is required"));
        }

        OtpElevateResponse response = otpService.elevateR2Session(actor, request.otpCode());
        if (!response.ok()) {
            return ResponseEntity.status(401).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<OtpStatusResponse> status(
            @RequestHeader(value = "x-actor-user-id", required = false) String actorHeader,
            @RequestHeader(value = "x-user-id", required = false) String userHeader
    ) {
        String actor = resolveActor(actorHeader, userHeader);
        OtpStatusResponse response = otpService.getR2ElevationStatus(actor);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/revoke")
    public ResponseEntity<OtpRevokeResponse> revoke(
            @RequestHeader(value = "x-actor-user-id", required = false) String actorHeader,
            @RequestHeader(value = "x-user-id", required = false) String userHeader
    ) {
        String actor = resolveActor(actorHeader, userHeader);
        OtpRevokeResponse response = otpService.revokeR2Session(actor);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test-ping")
    public ResponseEntity<OtpTestPingResponse> testPing(
            @RequestHeader(value = "x-actor-user-id", required = false) String actorHeader,
            @RequestHeader(value = "x-user-id", required = false) String userHeader,
            @RequestBody(required = false) OtpTestPingRequest request
    ) {
        String actor = resolveActor(actorHeader, userHeader);
        String channel = (request != null && request.channel() != null) ? request.channel() : "all";
        OtpTestPingResponse response = otpService.sendTestPing(actor, channel);
        return ResponseEntity.ok(response);
    }
}
