package com.moneyverse.api.domain.pension.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.pension.service.PensionLedgerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Certified national pension (QA 2026-11-25). Replaces the 404/503 answers the
 * pension page got for its funded and history calls. The legacy uncertified
 * contribute / toggle-retirement paths stay refused in PensionController.
 */
@Tag(name = "National Pension Ledger", description = "Treasury Core certified pension funding, refunds and owner history")
@RestController
@RequestMapping({"/api/pension", "/api/v1/pension"})
public class PensionLedgerController {
    private static final Pattern WLD = Pattern.compile("^[1-9][0-9]{0,79}$");
    private static final long MIN_CONTRIBUTION = 1000L;

    private final PensionLedgerService ledger;
    private final MemberApiGuard guard;

    public PensionLedgerController(PensionLedgerService ledger, MemberApiGuard guard) {
        this.ledger = ledger;
        this.guard = guard;
    }

    @GetMapping("/funded/position")
    @Operation(summary = "Session owner's certified funded pension escrow position")
    public ResponseEntity<?> position(HttpServletRequest request) {
        return privateOk(ledger.position(guard.actor(request)));
    }

    @GetMapping("/my-contributions")
    @Operation(summary = "Session owner's recorded pension contributions")
    public ResponseEntity<?> myContributions(HttpServletRequest request) {
        return privateOk(ledger.contributions(guard.actor(request)));
    }

    @GetMapping("/my-payouts")
    @Operation(summary = "Session owner's recorded pension payouts")
    public ResponseEntity<?> myPayouts(HttpServletRequest request) {
        return privateOk(ledger.payouts(guard.actor(request)));
    }

    @PostMapping("/funded/contribute")
    @Operation(summary = "Fund the pension escrow through treasury_core_post (session, CSRF, idempotency key)")
    public ResponseEntity<?> contribute(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        String amount = text(body, "amountWld");
        if (amount == null || !WLD.matcher(amount).matches() || (amount.length() < 5 && Long.parseLong(amount) < MIN_CONTRIBUTION)) {
            return ResponseEntity.badRequest().body(Map.of("code", "PENSION_AMOUNT_INVALID", "message", "At least 1,000 WLD, whole numbers only"));
        }
        UUID key = guard.idempotencyKey(text(body, "idempotencyKey"));
        return privateOk(ledger.post(actor, key, "NPS_FUND", amount));
    }

    @PostMapping("/funded/withdraw")
    @Operation(summary = "Refund certified escrow principal through treasury_core_post (session, CSRF, idempotency key)")
    public ResponseEntity<?> withdraw(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        String principal = text(body, "principalWld");
        if (principal == null || !WLD.matcher(principal).matches()) {
            return ResponseEntity.badRequest().body(Map.of("code", "PENSION_AMOUNT_INVALID", "message", "Whole positive WLD only"));
        }
        UUID key = guard.idempotencyKey(text(body, "idempotencyKey"));
        return privateOk(ledger.post(actor, key, "NPS_WITHDRAW", principal));
    }

    private static String text(Map<String, Object> body, String field) {
        if (body == null) return null;
        return body.get(field) instanceof String s ? s : null;
    }

    private static ResponseEntity<?> privateOk(Object body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(body);
    }
}
