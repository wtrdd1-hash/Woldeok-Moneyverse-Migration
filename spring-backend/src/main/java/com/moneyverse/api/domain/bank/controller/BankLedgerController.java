package com.moneyverse.api.domain.bank.controller;

import com.moneyverse.api.domain.bank.service.BankLedgerService;
import com.moneyverse.api.domain.bank.service.CreditRating;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Bank routes the /bank, /wallet and /progression pages call (QA 2026-11-25: 404 in Spring).
 * Money moves only through bank_purchase_bond / bank_redeem_bond / bank_repay.
 */
@Tag(name = "Bank ledger", description = "Bonds, repayments, credit rating and standing views")
@RestController
public class BankLedgerController {
    private static final Pattern WLD = Pattern.compile("^[1-9][0-9]{0,17}$");
    private static final Pattern WLD78 = Pattern.compile("^[1-9][0-9]{0,77}$");
    private static final Set<String> BOND_CODES = Set.of("BOND_7D", "BOND_30D");
    private final BankLedgerService bank;
    private final MemberApiGuard guard;

    public BankLedgerController(BankLedgerService bank, MemberApiGuard guard) {
        this.bank = bank;
        this.guard = guard;
    }

    @PostMapping({"/api/v1/banking/bonds/purchase", "/api/banking/bonds/purchase"})
    @Operation(summary = "Buy a 7-day or 30-day virtual bond (journaled)")
    public ResponseEntity<?> purchaseBond(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        String code = text(body, "bondCode"), amount = text(body, "amount");
        if (!BOND_CODES.contains(code) || amount == null || !WLD.matcher(amount).matches() || Long.parseLong(amount) < 1000) {
            return ResponseEntity.badRequest().body(Map.of("code", "BOND_INPUT_INVALID"));
        }
        UUID key = guard.idempotencyKey(text(body, "idempotencyKey"));
        return privateOk(bank.purchaseBond(actor, code, Long.parseLong(amount), key));
    }

    @PostMapping({"/api/v1/banking/bonds/{id}/redeem", "/api/banking/bonds/{id}/redeem"})
    @Operation(summary = "Redeem a matured bond (journaled)")
    public ResponseEntity<?> redeemBond(HttpServletRequest request, @PathVariable("id") String id, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        UUID bond = uuid(id);
        if (bond == null) return ResponseEntity.status(404).body(Map.of("code", "BOND_NOT_FOUND"));
        UUID key = guard.idempotencyKey(text(body, "idempotencyKey"));
        return privateOk(bank.redeemBond(actor, bond, key));
    }

    @PostMapping({"/api/v1/bank/loans/{id}/repayments", "/api/bank/loans/{id}/repayments"})
    @Operation(summary = "Repay part or all of a loan (journaled)")
    public ResponseEntity<?> repayLoan(HttpServletRequest request, @PathVariable("id") String id, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        UUID loan = uuid(id);
        String amount = text(body, "amount");
        if (loan == null) return ResponseEntity.status(404).body(Map.of("code", "LOAN_NOT_FOUND"));
        if (amount == null || !WLD78.matcher(amount).matches()) return ResponseEntity.badRequest().body(Map.of("code", "REPAY_AMOUNT_INVALID"));
        UUID key = guard.idempotencyKey(text(body, "idempotencyKey"));
        return privateOk(bank.repay(actor, loan, amount, key));
    }

    @PostMapping({"/api/v1/banking/repay-preview", "/api/banking/repay-preview"})
    @Operation(summary = "Nonbinding repayment preview from the member's standing")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> repayPreview(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        String loanId = text(body, "loanId"), amount = text(body, "amount");
        if (uuid(loanId) == null || amount == null || !WLD78.matcher(amount).matches()) {
            return ResponseEntity.badRequest().body(Map.of("code", "REPAY_PREVIEW_INPUT_INVALID"));
        }
        Map<String, Object> standing = bank.standing(actor);
        if (!(standing.get("active_loan") instanceof Map<?, ?> loanRaw)) return ResponseEntity.badRequest().body(Map.of("code", "ACTIVE_LOAN_UNAVAILABLE"));
        Map<String, Object> loan = (Map<String, Object>) loanRaw;
        Object status = loan.get("status");
        if (!loanId.equals(loan.get("loan_id")) || !("active".equals(status) || "overdue".equals(status))) {
            return ResponseEntity.badRequest().body(Map.of("code", "ACTIVE_LOAN_UNAVAILABLE"));
        }
        String cash = String.valueOf(standing.get("cash_balance")), debt = String.valueOf(loan.get("outstanding_amount"));
        if (!cash.matches("^[0-9]{1,78}$") || !WLD78.matcher(debt).matches()) {
            return ResponseEntity.status(503).body(Map.of("code", "BANK_STANDING_INVALID"));
        }
        return privateOk(BankLedgerService.preview(loanId, cash, amount, debt, true));
    }

    @GetMapping({"/api/v1/banking/standing/snapshot", "/api/banking/standing/snapshot"})
    @Operation(summary = "Nonbinding owner-only standing snapshot (not a ledger reconciliation)")
    public ResponseEntity<?> standingSnapshot(HttpServletRequest request) {
        Map<String, Object> s = bank.standing(guard.actor(request));
        Object loan = s.get("active_loan");
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("currency", "WLD");
        out.put("cashBalance", amount(s.get("cash_balance")));
        out.put("depositBalance", amount(s.get("bank_balance")));
        out.put("unclaimedInterest", amount(s.get("unclaimed_interest")));
        out.put("activeLoanOutstanding", loan instanceof Map<?, ?> m ? amount(m.get("outstanding_amount")) : null);
        out.put("observedAt", Instant.now().toString());
        out.put("readOnly", true);
        return privateOk(out);
    }

    @GetMapping({"/api/v1/banking/credit-rating", "/api/banking/credit-rating"})
    @Operation(summary = "Game-only credit score from the member's own facts")
    public ResponseEntity<?> creditRating(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        Map<String, Object> s = bank.standing(actor);
        Map<String, Object> f = bank.creditFacts(actor);
        int age = num(f.get("account_age_days")), job = num(f.get("job_level")), rep = num(f.get("repayment_count")), od = num(f.get("overdue_count"));
        Map<String, Object> r = new LinkedHashMap<>(CreditRating.evaluate(age, job,
                CreditRating.capAssets(s.get("cash_balance")), CreditRating.capAssets(s.get("bank_balance")), rep, od));
        r.put("userId", actor.toString());
        r.put("assessmentStatus", "SIMULATED_FROM_GAME_HISTORY");
        r.put("evidence", Map.of("accountAgeDays", age, "jobLevel", job, "repaymentEvents", rep, "overdueLoans", od));
        return privateOk(r);
    }

    private static String amount(Object v) {
        String s = String.valueOf(v);
        if (!s.matches("^(0|[1-9][0-9]{0,77})$")) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "BANK_STANDING_INVALID");
        return s;
    }

    private static int num(Object v) { return v instanceof Number n ? n.intValue() : 0; }

    private static String text(Map<String, Object> body, String name) {
        if (body == null) return null;
        Object v = body.get(name);
        return v instanceof String s ? s.trim() : v instanceof Number n ? n.toString() : null;
    }

    private static UUID uuid(String raw) {
        try { return raw == null ? null : UUID.fromString(raw); } catch (IllegalArgumentException e) { return null; }
    }

    private static ResponseEntity<?> privateOk(Object body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(body);
    }
}
