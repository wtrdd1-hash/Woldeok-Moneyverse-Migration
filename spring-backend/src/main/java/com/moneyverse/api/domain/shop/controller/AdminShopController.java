package com.moneyverse.api.domain.shop.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.shop.service.AdminShopService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Reads use the canonical database boundary; unsupported commands never manufacture receipts. */
@RestController
@RequestMapping({"/api/v1/admin/shop","/api/admin/shop","/admin/shop"})
public class AdminShopController {
    private final AdminAuthService auth;
    private final AdminShopService shop;
    public AdminShopController(AdminAuthService auth,AdminShopService shop){this.auth=auth;this.shop=shop;}
    private static ResponseEntity<?> error(int status,String code){
        return ResponseEntity.status(status).header("Cache-Control","private, no-store").header("Vary","Cookie")
            .body(Map.of("success",false,"code",code));
    }
    @GetMapping("/items")
    public ResponseEntity<?> listAdminItems(HttpServletRequest request,@RequestParam(name="category",required=false) String category){
        var actor=auth.resolveVerifiedAdminActor(request);
        if(actor.isEmpty())return error(401,"SESSION_REQUIRED");
        try{
            var items=shop.list(actor.get(),category);
            return ResponseEntity.ok().header("Cache-Control","private, no-store").header("Vary","Cookie")
                .header("X-MV-Owner",actor.get().toString()).body(Map.of("items",items));
        }catch(ResponseStatusException failure){return error(failure.getStatusCode().value(),failure.getReason());}
    }
    private ResponseEntity<?> unavailableCommand(HttpServletRequest request,String code){
        if(auth.resolveVerifiedAdminActor(request).isEmpty())return error(401,"SESSION_REQUIRED");
        if(!auth.hasVerifiedSessionCsrf(request))return error(403,"CSRF_REQUIRED");
        // Migration168 has no complete native step-up/idempotency/audit command contract.
        return error(503,code);
    }
    @PostMapping("/items")
    public ResponseEntity<?> createItem(HttpServletRequest request,@RequestBody(required=false) Map<String,Object> body){
        return unavailableCommand(request,"CANONICAL_SHOP_CREATE_UNAVAILABLE");
    }
    @PatchMapping("/items/{id}")
    public ResponseEntity<?> updateItem(HttpServletRequest request,@PathVariable("id") UUID id,@RequestBody(required=false) Map<String,Object> body){
        return unavailableCommand(request,"ADMIN_SHOP_STEP_UP_UNAVAILABLE");
    }
    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(HttpServletRequest request,@PathVariable("id") UUID id){
        return unavailableCommand(request,"CANONICAL_SHOP_DELETE_UNAVAILABLE");
    }
}
