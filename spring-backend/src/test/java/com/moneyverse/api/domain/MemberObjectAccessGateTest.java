package com.moneyverse.api.domain;

import com.moneyverse.api.domain.admin.service.EncryptionService;
import com.moneyverse.api.domain.identity.controller.AccountController;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.identity.service.ProfileService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.market.controller.BlackMarketController;
import com.moneyverse.api.domain.market.service.BlackMarketService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * BOLA/IDOR sweep 2026-11-28 (member endpoints that take an object id):
 * - unlinking a login method answered success without unlinking anything, so a member believed a
 *   compromised provider was removed while it could still sign in;
 * - the sealed ("secret") auction bid log was public and unauthenticated, exposing bidder ids,
 *   names and amounts, and on any read error it served invented bids instead;
 * - customising a pocket answered success for an id the caller does not own (the owner predicate
 *   matched no row), which hides the refusal.
 */
class MemberObjectAccessGateTest {
    private final UserAuthService auth = mock(UserAuthService.class);
    private final MockHttpServletRequest request = new MockHttpServletRequest();

    private void member() {
        UserAuthService.SessionInfo s = new UserAuthService.SessionInfo();
        s.setUserId(UUID.randomUUID());
        s.setRoles(List.of());
        when(auth.resolveSession(any())).thenReturn(Optional.of(s));
    }

    private static int status(org.junit.jupiter.api.function.Executable call) {
        return assertThrows(ResponseStatusException.class, call).getStatusCode().value();
    }

    @Test void unlinkingALoginMethodDoesNotClaimSuccess() {
        member();
        AccountController c = new AccountController(auth, mock(ProfileService.class), mock(JdbcTemplate.class),
                mock(EncryptionService.class));
        assertEquals(503, status(() -> c.unlinkIdentity(request, UUID.randomUUID().toString())));
    }

    @Test void sealedAuctionBidLogIsNotPublic() {
        BlackMarketService service = mock(BlackMarketService.class);
        BlackMarketController c = new BlackMarketController(service, mock(MemberApiGuard.class));
        assertEquals(503, status(() -> c.listBidLogs(UUID.randomUUID().toString())));
        verifyNoInteractions(service);
    }

    @Test void sealedAuctionBidLogServiceNeverInventsBids() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), any(Object[].class)))
                .thenThrow(new RuntimeException("permission denied"));
        BlackMarketService s = new BlackMarketService(jdbc);
        assertEquals(503, status(() -> s.listBidLogs(UUID.randomUUID().toString())));
    }

    // Pocket customisation: the integration line ports it to bank_customize_pocket (owner-scoped,
    // idempotent, charged); PocketCustomizeSourceTest covers it there.
}
