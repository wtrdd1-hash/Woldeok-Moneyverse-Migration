package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.identity.dto.IdentityDtos.UserProfile;
import com.moneyverse.api.domain.identity.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Profile", description = "유저 프로필 및 계정 정보 API")
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    @Operation(summary = "내 프로필 상세 정보 조회")
    public ApiResponse<UserProfile> getMyProfile(
            @RequestHeader(value = "X-User-Id", defaultValue = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20") String userId) {
        return ApiResponse.ok(profileService.getProfile(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "특정 사용자 공개 프로필 조회")
    public ApiResponse<UserProfile> getUserProfile(@PathVariable("id") String userId) {
        return ApiResponse.ok(profileService.getProfile(userId));
    }
}
