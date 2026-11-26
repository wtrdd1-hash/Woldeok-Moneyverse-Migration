package com.moneyverse.api.domain.wallet;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.wallet.controller.WalletTransactionDetailController;
import com.moneyverse.api.domain.wallet.controller.UnverifiedSourceController;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** QA 2026-11-25: these routes were 404 in Spring; detail is owner-scoped, the rest honest 503s. */
class WalletTransactionDetailTest {
    @Test void malformedIdIsRefusedBeforeTheDatabase() {
        MemberApiGuard guard = mock(MemberApiGuard.class);
        JdbcClient jdbc = mock(JdbcClient.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(guard.actor(request)).thenReturn(UUID.randomUUID());
        assertEquals(HttpStatus.BAD_REQUEST, new WalletTransactionDetailController(jdbc, guard).detail(request, "nope").getStatusCode());
        verifyNoInteractions(jdbc);
    }

    @Test void labelsMatchTheNestJsTable() {
        assertEquals("보상 지급", WalletTransactionDetailController.label("MINT_TO_USER"));
        assertEquals("대출 상환", WalletTransactionDetailController.label("BANK_LOAN_REPAYMENT"));
        assertEquals("경제 활동", WalletTransactionDetailController.label("SOMETHING_NEW"));
    }

    @Test void unverifiedSourcesAnswer503WithACode() {
        var c = new UnverifiedSourceController();
        assertEquals(503, c.treasuryPublicOverview().getStatusCode().value());
        assertEquals("PUBLIC_TREASURY_RECONCILIATION_PENDING", ((Map<?, ?>) c.treasuryPublicOverview().getBody()).get("code"));
        assertEquals(503, c.notificationSearch().getStatusCode().value());
        assertEquals(503, c.commercialRates().getStatusCode().value());
        assertEquals(503, c.mintAuditCertificates().getStatusCode().value());
    }
}
