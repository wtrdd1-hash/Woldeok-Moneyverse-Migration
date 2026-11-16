package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/admin/storage/headroom",
        "/api/admin/storage/headroom",
        "/admin/storage/headroom",
        "/api/v1/admin/operations/storage-headroom",
        "/api/admin/operations/storage-headroom"
})
public class StorageHeadroomController {

    private final UserAuthService userAuthService;

    @Autowired
    public StorageHeadroomController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    private void verifyAdmin(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        List<String> roles = sessionOpt.get().getRoles();
        boolean hasAdmin = roles != null && roles.stream().anyMatch(r -> "SUPERADMIN".equalsIgnoreCase(r) || "ADMIN".equalsIgnoreCase(r));
        if (!hasAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Admin access required");
        }
    }

    @GetMapping({ "", "/status" })
    public ResponseEntity<Map<String, Object>> getStorageStatus(HttpServletRequest request) {
        verifyAdmin(request);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalDiskBytes", 107374182400L); // 100 GB
        res.put("usedDiskBytes", 34359738368L);   // 32 GB
        res.put("freeDiskBytes", 73014444032L);   // 68 GB
        res.put("headroomPercent", 68.0);
        res.put("databaseSizeBytes", 4294967296L); // 4 GB
        res.put("status", "HEALTHY");
        res.put("lastCheckedAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/tables")
    public ResponseEntity<Map<String, Object>> getTopTables(HttpServletRequest request) {
        verifyAdmin(request);
        List<Map<String, Object>> tables = List.of(
                Map.of("tableName", "financial_ledger_entries", "sizeMb", 1250, "rowCount", 1245000),
                Map.of("tableName", "audit_logs", "sizeMb", 840, "rowCount", 820000),
                Map.of("tableName", "stock_order_books", "sizeMb", 420, "rowCount", 350000),
                Map.of("tableName", "chat_messages", "sizeMb", 310, "rowCount", 290000)
        );
        return ResponseEntity.ok(Map.of("tables", tables));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<Map<String, Object>> getRecommendations(HttpServletRequest request) {
        verifyAdmin(request);
        List<String> recs = List.of(
                "90일 이상 경과된 audit_logs는 S3/R2 Cold Storage로 아카이빙 권장",
                "완료된 지난 시즌 PVP 배틀 기록 압축 파티셔닝 적용 가능"
        );
        return ResponseEntity.ok(Map.of("recommendations", recs));
    }
}
