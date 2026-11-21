package com.moneyverse.api.domain.wallet.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.wallet.dto.WalletDtos.WalletOverview;
import com.moneyverse.api.domain.wallet.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Regression: request headers must NEVER authenticate the owner of a wallet. */
class WalletHeaderIdentityRegressionTest {
    private final WalletService service = mock(WalletService.class);
    private final UserAuthService auth = mock(UserAuthService.class);
    private final HttpServletRequest request = mock(HttpServletRequest.class);
    private final WalletController wallet = new WalletController(service, auth);

    @Test void anonymousRandomActorHeaderMustNotRevealWalletSummary() {
        when(auth.resolveSession(request)).thenReturn(Optional.empty());
        var response = wallet.getSummary(request, UUID.randomUUID().toString());
        assertEquals(Boolean.FALSE, response.getBody().get("signedIn"));
        assertNull(response.getBody().get("totalAvailableAmount"));
        verifyNoInteractions(service);
    }
    @Test void anonymousActorHeaderMustNotResolveOverviewOrBalance() {
        when(auth.resolveSession(request)).thenReturn(Optional.empty());
        String forged = UUID.randomUUID().toString();
        assertThrows(ResponseStatusException.class, () -> wallet.getOverview(request, forged));
        assertThrows(ResponseStatusException.class, () -> wallet.getBalance(request, forged));
        verifyNoInteractions(service);
    }
    @Test void realSessionIdentityMustWinOverAnyForgedClientHeader() {
        var session = new UserAuthService.SessionInfo();
        var owner = UUID.randomUUID();
        session.setUserId(owner);
        when(auth.resolveSession(request)).thenReturn(Optional.of(session));
        var data = mock(WalletOverview.class);
        when(data.getBalanceWld()).thenReturn("12345678901234567890");
        when(service.getOverview(owner.toString())).thenReturn(data);
        var summary = wallet.getSummary(request, UUID.randomUUID().toString());
        assertEquals(Boolean.TRUE, summary.getBody().get("signedIn"));
        assertEquals("12345678901234567890", summary.getBody().get("totalAvailableAmount"));
        verify(service).getOverview(owner.toString());
        verifyNoMoreInteractions(service);
    }
}
