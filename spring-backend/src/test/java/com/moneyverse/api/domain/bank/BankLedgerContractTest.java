package com.moneyverse.api.domain.bank;

import com.moneyverse.api.domain.bank.controller.BankLedgerController;
import com.moneyverse.api.domain.bank.service.BankLedgerService;
import com.moneyverse.api.domain.bank.service.CreditRating;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * QA 2026-11-25: /bank called bonds/purchase, bonds/{id}/redeem, credit-rating, repay-preview,
 * standing/snapshot and bank/loans/{id}/repayments, none of which Spring mapped (404).
 */
class BankLedgerContractTest {
    static final UUID ACTOR = UUID.fromString("00000000-0000-4000-8000-000000000123");
    static final String KEY = "6f1c1d36-8d0a-4a39-9d65-1a2b3c4d5e6f";
    final MemberApiGuard guard = mock(MemberApiGuard.class);
    final BankLedgerService bank = mock(BankLedgerService.class);
    final HttpServletRequest request = mock(HttpServletRequest.class);
    final BankLedgerController controller = new BankLedgerController(bank, guard);

    @Test void bondPurchaseUsesTheJournaledFunctionWithValidatedInput() {
        when(guard.verifiedMutationActor(request)).thenReturn(ACTOR);
        when(guard.idempotencyKey(KEY)).thenReturn(UUID.fromString(KEY));
        assertEquals(HttpStatus.BAD_REQUEST, controller.purchaseBond(request, Map.of("bondCode", "BOND_1Y", "amount", "5000", "idempotencyKey", KEY)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.purchaseBond(request, Map.of("bondCode", "BOND_7D", "amount", "999", "idempotencyKey", KEY)).getStatusCode());
        verifyNoInteractions(bank);
        when(bank.purchaseBond(ACTOR, "BOND_7D", 5000L, UUID.fromString(KEY))).thenReturn(Map.of("bond_id", "b"));
        assertEquals(HttpStatus.OK, controller.purchaseBond(request, Map.of("bondCode", "BOND_7D", "amount", "5000", "idempotencyKey", KEY)).getStatusCode());
    }

    @Test void writesWithoutCsrfNeverReachTheLedger() {
        when(guard.verifiedMutationActor(request)).thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "CSRF_REQUIRED"));
        assertThrows(ResponseStatusException.class, () -> controller.repayLoan(request, UUID.randomUUID().toString(), Map.of("amount", "10", "idempotencyKey", KEY)));
        verifyNoInteractions(bank);
    }

    @Test void repaymentPreviewMatchesTheNestJsArithmetic() {
        var p = BankLedgerService.preview("L", "5000", "3000", "1000", true);
        assertEquals("1000", p.get("payableAmount"));
        assertEquals("4000", p.get("cashAfter"));
        assertEquals("0", p.get("debtAfter"));
        assertEquals("2000", p.get("adjustmentAmount"));
        assertEquals("ready", p.get("reason"));
        var poor = BankLedgerService.preview("L", "500", "1000", "800", true);
        assertNull(poor.get("cashAfter"));
        assertEquals("insufficient_cash", poor.get("reason"));
    }

    @Test void creditScoreMatchesTheNestJsFormula() {
        // base 500 + activity min(100, 30*2)=60 + job min(150, 3*15)=45 + wealth min(150, floor(20000/5000)*10)=40
        // + repayment min(150, 2*25)=50 - overdue 0 = 695 -> tier 4
        var r = CreditRating.evaluate(30, 3, 15000, 5000, 2, 0);
        assertEquals(695, r.get("score"));
        assertEquals(4, r.get("tier"));
        assertEquals(250_000, r.get("creditLimitWld"));
        assertEquals(10, CreditRating.evaluate(0, 0, 0, 0, 0, 3).get("tier"));
        assertEquals(75_000L, CreditRating.capAssets("900000"));
    }
}
