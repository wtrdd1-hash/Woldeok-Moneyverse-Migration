package com.moneyverse.api.domain.content.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/content",
        "/api/content",
        "/content",
        "/api/v1/announcements",
        "/api/announcements",
        "/announcements"
})
public class AppContentController {
    private final com.moneyverse.api.domain.content.service.ContentPublicationService publications;
    private final com.moneyverse.api.domain.status.StatusTruthService statusTruth;
    public AppContentController(com.moneyverse.api.domain.content.service.ContentPublicationService publications,
            com.moneyverse.api.domain.status.StatusTruthService statusTruth){this.publications=publications;this.statusTruth=statusTruth;}
    @GetMapping(path = {"", "/", "/announcements"})
    public ResponseEntity<Map<String,Object>> announcements(@RequestParam(required=false) String limit){
        return ResponseEntity.ok(Map.of("announcements",publications.announcements(limit)));
    }
    @GetMapping("/photos")
    public ResponseEntity<Map<String,Object>> photos(@RequestParam(required=false) String limit){
        return ResponseEntity.ok(Map.of("photos",publications.photos(limit)));
    }
    @GetMapping("/status")
    public ResponseEntity<com.moneyverse.api.domain.status.StatusSourceTruthPolicy.StatusResponse> status(){
        return ResponseEntity.ok(statusTruth.publicStatus());
    }
}
