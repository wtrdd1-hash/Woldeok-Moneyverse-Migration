package com.moneyverse.presentation;

import com.moneyverse.api.domain.health.NativeBuildIdentity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class NativePresentationIdentityController {
    private final NativeBuildIdentity identity;
    public NativePresentationIdentityController(NativeBuildIdentity identity){this.identity=identity;}
    @GetMapping("/frontend-version")
    public ResponseEntity<?> version(){
        return identity.sourceSha().<ResponseEntity<?>>map(sha->ResponseEntity.ok()
            .header("Cache-Control","private, no-store").header("X-MV-Source-SHA",sha)
            .body(Map.of("ok",true,"id",sha,"scope","public-presentation-only")))
            .orElseGet(()->ResponseEntity.status(503).header("Cache-Control","private, no-store")
                .body(Map.of("ok",false,"code","BUILD_IDENTITY_UNAVAILABLE","scope","public-presentation-only")));
    }
    @GetMapping("/presentation-health")
    public ResponseEntity<?> health(){
        return ResponseEntity.ok().header("Cache-Control","private, no-store")
            .body(Map.of("ok",true,"scope","public-presentation-only","databaseRequired",false));
    }
}
