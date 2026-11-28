package com.moneyverse.api.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/controls",
        "/api/controls",
        "/controls",
        "/api/v1/admin/controls/public",
        "/api/admin/controls/public"
})
public class ControlsController {

    @GetMapping("/flags")
    public ResponseEntity<Map<String, Object>> getPublicFlags() {
        // Security review 2026-11-28: this answered with constants an operator would act on.
        // Unavailable until read from its canonical source; never invented evidence.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "CONTROLS_SOURCE_UNAVAILABLE");
    }

    @GetMapping("/kill-switches")
    public ResponseEntity<Map<String, Object>> getKillSwitches() {
        // Security review 2026-11-28: this answered with constants an operator would act on.
        // Unavailable until read from its canonical source; never invented evidence.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "CONTROLS_SOURCE_UNAVAILABLE");
    }
}
