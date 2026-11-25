package com.moneyverse.api.domain.club.controller;

import com.moneyverse.api.domain.club.service.ClubReadService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Club pages (QA 2026-11-25: /api/v1/clubs/** was 404). Reads only, ported from
 * the NestJS ClubController. Creation and project contributions are refused as in
 * NestJS: club_create / club_contribute_project do not journal WLD. Membership,
 * feed and canvas writes need a club to exist, which creation does not allow yet.
 */
@Tag(name = "Clubs", description = "Club reads; settlements refused until journaled")
@RestController
@RequestMapping({"/api/v1/clubs", "/api/clubs"})
public class ClubReadController {
    private static final Map<String, String> SETTLEMENT_REFUSAL = Map.of("code", "CLUB_LEDGER_SETTLEMENT_UNAVAILABLE",
            "message", "Club WLD settlement is unavailable pending verified ledger and replay receipts");
    private final ClubReadService clubs;
    private final MemberApiGuard guard;

    public ClubReadController(ClubReadService clubs, MemberApiGuard guard) {
        this.clubs = clubs;
        this.guard = guard;
    }

    @GetMapping
    @Operation(summary = "Active clubs, owner-aware")
    public ResponseEntity<?> list(HttpServletRequest request, @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "limit", required = false) String limit, @RequestParam(value = "offset", required = false) String offset) {
        UUID actor = guard.actor(request);
        Integer l = paging(limit, 50, 1, 100), o = paging(offset, 0, 0, 10000);
        if (l == null || o == null) return ResponseEntity.badRequest().body(Map.of("code", "CLUB_PAGING_INVALID"));
        String q = search == null || search.isBlank() ? null : search.trim();
        if (q != null && q.length() > 50) q = q.substring(0, 50);
        return privateOk(Map.of("clubs", clubs.list(actor, q, l, o)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(HttpServletRequest request, @PathVariable("id") String id) {
        UUID actor = guard.actor(request);
        Optional<UUID> club = uuid(id);
        if (club.isEmpty()) return notFound();
        return clubs.get(club.get(), actor).<ResponseEntity<?>>map(c -> privateOk(Map.of("club", c))).orElseGet(ClubReadController::notFound);
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<?> members(HttpServletRequest request, @PathVariable("id") String id,
            @RequestParam(value = "limit", required = false) String limit, @RequestParam(value = "offset", required = false) String offset) {
        UUID actor = guard.actor(request);
        Optional<UUID> club = uuid(id);
        Integer l = paging(limit, 50, 1, 100), o = paging(offset, 0, 0, 10000);
        if (club.isEmpty()) return notFound();
        if (l == null || o == null) return ResponseEntity.badRequest().body(Map.of("code", "CLUB_PAGING_INVALID"));
        return privateOk(Map.of("members", clubs.members(club.get(), actor, l, o)));
    }

    @GetMapping("/{id}/projects")
    public ResponseEntity<?> projects(HttpServletRequest request, @PathVariable("id") String id) {
        guard.actor(request);
        Optional<UUID> club = uuid(id);
        return club.isEmpty() ? notFound() : privateOk(Map.of("projects", clubs.projects(club.get())));
    }

    @GetMapping("/{id}/feed")
    public ResponseEntity<?> feed(HttpServletRequest request, @PathVariable("id") String id) {
        guard.actor(request);
        Optional<UUID> club = uuid(id);
        return club.isEmpty() ? notFound() : privateOk(Map.of("posts", clubs.feed(club.get(), 50)));
    }

    @GetMapping("/{id}/canvas")
    public ResponseEntity<?> canvas(HttpServletRequest request, @PathVariable("id") String id) {
        guard.actor(request);
        Optional<UUID> club = uuid(id);
        if (club.isEmpty()) return notFound();
        return privateOk(Map.of("canvas", clubs.canvas(club.get()).orElse(null) == null ? Map.of() : clubs.canvas(club.get()).get()));
    }

    @PostMapping
    @Operation(summary = "Create a club: refused (club_create does not journal the charter fee)")
    public ResponseEntity<?> create() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(SETTLEMENT_REFUSAL);
    }

    @PostMapping("/{id}/projects/{projectId}/contributions")
    @Operation(summary = "Contribute WLD: refused (club_contribute_project does not journal WLD)")
    public ResponseEntity<?> contribute() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(SETTLEMENT_REFUSAL);
    }

    private static Integer paging(String raw, int fallback, int min, int max) {
        if (raw == null || raw.isBlank()) return fallback;
        try { int v = Integer.parseInt(raw.trim()); return v >= min && v <= max ? v : null; }
        catch (NumberFormatException e) { return null; }
    }

    private static Optional<UUID> uuid(String raw) {
        try { return Optional.of(UUID.fromString(raw)); } catch (RuntimeException e) { return Optional.empty(); }
    }

    private static ResponseEntity<?> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("code", "CLUB_NOT_FOUND"));
    }

    private static ResponseEntity<?> privateOk(Object body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(body);
    }
}
