package com.moneyverse.api.domain.wallet.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class WalletCompatibilityControllerTest {
    @Test
    void ignoresForgedUserHeaderAndRejectsAnonymousCallerBeforeAnyLedgerRead() {
        UserAuthService auth = mock(UserAuthService.class);
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("X-User-Id")).thenReturn(UUID.randomUUID().toString());
        when(auth.resolveSession(request)).thenReturn(Optional.empty());
        WalletCompatibilityController controller = new WalletCompatibilityController(auth, jdbc);

        assertThatThrownBy(() -> controller.overview(request, "50"))
            .isInstanceOfSatisfying(ResponseStatusException.class,
                error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));
        verifyNoInteractions(jdbc);
    }

    @Test
    void onlyLedgerBackedAccountAmountsAreReturnedAndMismatchedSourceFailsClosed() {
        UserAuthService auth = mock(UserAuthService.class);
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        UUID owner = UUID.randomUUID();
        SessionInfo session = new SessionInfo();
        session.setUserId(owner);
        when(auth.resolveSession(request)).thenReturn(Optional.of(session));
        when(jdbc.queryForList(contains("FROM public.accounts"), eq(owner))).thenReturn(List.of(
            Map.of("account_type", "USER_CASH", "available_amount", "250", "updated_at", "2026-11-17T12:00:00.000Z"),
            Map.of("account_type", "USER_BANK", "available_amount", "750", "updated_at", "2026-11-17T12:00:00.000Z")
        ));
        when(jdbc.queryForList(contains("FROM public.ledger_transactions"), eq(owner), eq(11))).thenReturn(List.of());
        WalletCompatibilityController controller = new WalletCompatibilityController(auth, jdbc);

        var response = controller.overview(request, "10");
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getFirst("Cache-Control")).contains("no-store");
        assertThat(response.getBody()).containsEntry("userId", owner.toString());
        @SuppressWarnings("unchecked") var balances = (Map<String, Object>) response.getBody().get("balances");
        assertThat(balances).containsEntry("totalAvailableAmount", "1000");
        verify(jdbc).queryForList(contains("FROM public.accounts"), eq(owner));
        verify(jdbc).queryForList(contains("FROM public.ledger_transactions"), eq(owner), eq(11));
    }

    @Test
    void unavailableOrPartialLedgerNeverBecomesZeroOrFakeBalance() {
        UserAuthService auth = mock(UserAuthService.class);
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        UUID owner = UUID.randomUUID();
        SessionInfo session = new SessionInfo();
        session.setUserId(owner);
        when(auth.resolveSession(request)).thenReturn(Optional.of(session));
        when(jdbc.queryForList(contains("FROM public.accounts"), eq(owner))).thenReturn(List.of(
            Map.of("account_type", "USER_CASH", "available_amount", "0", "updated_at", "2026-11-17T12:00:00.000Z")
        ));

        assertThatThrownBy(() -> new WalletCompatibilityController(auth, jdbc).overview(request, null))
            .isInstanceOfSatisfying(ResponseStatusException.class,
                error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
    }
}
