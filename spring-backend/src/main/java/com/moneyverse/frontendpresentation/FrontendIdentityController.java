package com.moneyverse.frontendpresentation;

import com.moneyverse.api.domain.health.NativeBuildIdentity;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public final class FrontendIdentityController {
    private final NativeBuildIdentity identity;
    public FrontendIdentityController(NativeBuildIdentity identity){this.identity=identity;}
    @GetMapping("/frontend-ui-health")
    public ResponseEntity<?> health(){return ResponseEntity.ok().header("Cache-Control","private, no-store")
        .body(Map.of("ok",true,"runtime","frontend-presentation","databaseRequired",false,"wholeSiteAccepted",false));}
    @GetMapping("/frontend-ui-version")
    public ResponseEntity<?> version(){
        return identity.sourceSha().<ResponseEntity<?>>map(sha->ResponseEntity.ok().header("Cache-Control","private, no-store")
            .header("X-MV-Source-SHA",sha).body(Map.of("ok",true,"id",sha,"scope","unified-frontend-only")))
            .orElseGet(()->ResponseEntity.status(503).header("Cache-Control","private, no-store")
                .body(Map.of("ok",false,"code","BUILD_IDENTITY_UNAVAILABLE")));
    }
}
