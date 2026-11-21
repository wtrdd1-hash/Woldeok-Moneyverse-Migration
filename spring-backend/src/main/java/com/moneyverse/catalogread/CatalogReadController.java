package com.moneyverse.catalogread;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.health.NativeBuildIdentity;
import com.moneyverse.api.domain.shop.controller.AdminShopController;
import com.moneyverse.api.domain.shop.service.AdminShopService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.*;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.bind.annotation.*;

/** Restrict connection identity and transaction mode before resolving the existing authoritative actor. */
@RestController
public final class CatalogReadController {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate reads;
    private final AdminShopController catalog;
    private final NativeBuildIdentity identity;
    public CatalogReadController(JdbcTemplate jdbc,PlatformTransactionManager manager,AdminAuthService auth,AdminShopService shop,NativeBuildIdentity identity){
        this.jdbc=jdbc;this.identity=identity;catalog=new AdminShopController(auth,shop);
        reads=new TransactionTemplate(manager);reads.setReadOnly(true);reads.setTimeout(5);
        reads.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }
    private void verifyDatabase(){
        if(!"moneyverse_app".equals(jdbc.queryForObject("SELECT current_user",String.class))
            ||!"on".equals(jdbc.queryForObject("SHOW transaction_read_only",String.class)))
            throw new IllegalStateException("Canonical catalog requires the application role and a read-only transaction");
    }
    private static ResponseEntity<?> unavailable(){
        return ResponseEntity.status(503).header("Cache-Control","private, no-store").header("Vary","Cookie")
            .body(Map.of("success",false,"code","CANONICAL_CATALOG_SOURCE_UNAVAILABLE"));
    }
    @GetMapping("/api/v1/admin/shop/items")
    public ResponseEntity<?> items(HttpServletRequest request,@RequestParam(name="category",required=false) String category){
        try{return reads.execute(status->{verifyDatabase();return catalog.listAdminItems(request,category);});}
        catch(Exception unavailable){return unavailable();}
    }
    @GetMapping("/catalog-read-health")
    public ResponseEntity<?> health(){
        try{return reads.execute(status->{
            verifyDatabase();
            if(!Boolean.TRUE.equals(jdbc.queryForObject("SELECT has_function_privilege(current_user,'public.admin_shop_items(uuid)','EXECUTE')",Boolean.class)))
                throw new IllegalStateException("Canonical catalog read is not available");
            return ResponseEntity.ok().header("Cache-Control","private, no-store").body(Map.of("ok",true,"runtime","catalog-read","databaseRequired",true,"readOnly",true,"wholeSiteAccepted",false));
        });}catch(Exception unavailable){return unavailable();}
    }
    @GetMapping("/catalog-read-version")
    public ResponseEntity<?> version(){
        return identity.sourceSha().<ResponseEntity<?>>map(sha->ResponseEntity.ok().header("Cache-Control","private, no-store")
            .header("X-MV-Source-SHA",sha).body(Map.of("ok",true,"id",sha,"scope","canonical-admin-catalog-read-only")))
            .orElseGet(CatalogReadController::unavailable);
    }
}
