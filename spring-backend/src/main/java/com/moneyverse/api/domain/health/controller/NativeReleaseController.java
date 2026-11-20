package com.moneyverse.api.domain.health.controller;

import com.moneyverse.api.domain.health.NativeBuildIdentity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public final class NativeReleaseController {
    private final NativeBuildIdentity identity;

    public NativeReleaseController(NativeBuildIdentity identity) {
        this.identity=identity;
    }

    @GetMapping({"/api/version","/frontend-version"})
    public ResponseEntity<Map<String,Object>> version() {
        var revision=identity.sourceSha();
        if(revision.isEmpty()) {
            return ResponseEntity.status(503).header("Cache-Control","private, no-store")
                .body(Map.of("ok",false,"success",false,"code","BUILD_IDENTITY_UNAVAILABLE"));
        }
        String sha=revision.get();
        var data=Map.<String,Object>of(
            "version","native-"+sha.substring(0,12),
            "applicationSourceSha",sha,
            "framework","Spring Boot 3.3.5",
            "release","nov18-native-frontend",
            "activeEngine","Java Spring Boot");
        return ResponseEntity.ok().header("Cache-Control","private, no-store")
            .header("X-MV-Source-SHA",sha)
            .body(Map.of("id",sha,"success",true,"ok",true,
                "runtime","Spring-MVC-Thymeleaf",
                "scope","native-frontend-and-owned-api","data",data));
    }
}
