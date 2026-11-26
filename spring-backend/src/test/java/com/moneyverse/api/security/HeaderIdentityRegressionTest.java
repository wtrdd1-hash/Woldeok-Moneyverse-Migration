package com.moneyverse.api.security;

import com.moneyverse.api.domain.bond.controller.BondController;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.marketplace.controller.MarketplaceController;
import com.moneyverse.api.domain.season.controller.SeasonController;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ValueConstants;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Parameter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * QA 2026-11-25 (critical): POST /seasons/rewards/claim, /marketplace/listings(/{id}/buy)
 * and /bonds/subscribe|repo-loans/* sat outside the session filter and took the
 * member from an X-User-Id header defaulting to a fixed member; the season claim
 * then added 10,000 WLD to wallets directly, unlimited, outside the ledger.
 */
class HeaderIdentityRegressionTest {
    final MemberApiGuard guard = mock(MemberApiGuard.class);
    final HttpServletRequest request = mock(HttpServletRequest.class);

    @Test void noControllerDefaultsTheMemberFromAHeader() throws Exception {
        var resolver = new PathMatchingResourcePatternResolver();
        int scanned = 0;
        for (var r : resolver.getResources("classpath*:com/moneyverse/**/*Controller.class")) {
            String path = r.getURL().getPath();
            String cls = path.substring(path.indexOf("com/moneyverse/")).replace('/', '.').replace(".class", "");
            Class<?> c = Class.forName(cls);
            scanned++;
            for (var m : c.getDeclaredMethods()) {
                for (Parameter p : m.getParameters()) {
                    RequestHeader h = p.getAnnotation(RequestHeader.class);
                    if (h == null) continue;
                    String name = h.value().isEmpty() ? h.name() : h.value();
                    if ("X-User-Id".equalsIgnoreCase(name) || "x-actor-user-id".equalsIgnoreCase(name)) {
                        assertEquals(ValueConstants.DEFAULT_NONE, h.defaultValue(), c.getSimpleName() + "." + m.getName() + " defaults the member from a header");
                    }
                }
            }
        }
        assertTrue(scanned > 50, "controller scan found " + scanned);
    }

    @Test void anonymousWritesAreRefusedBeforeAnyService() {
        when(guard.verifiedMutationActor(request)).thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED"));
        var season = new SeasonController(null, guard);
        var market = new MarketplaceController(null, guard);
        var bond = new BondController(null, guard);
        assertThrows(ResponseStatusException.class, () -> season.claimReward(request));
        assertThrows(ResponseStatusException.class, () -> market.createListing(request));
        assertThrows(ResponseStatusException.class, () -> market.buyListing(request, "x"));
        assertThrows(ResponseStatusException.class, () -> bond.subscribe(request));
        assertThrows(ResponseStatusException.class, () -> bond.borrowRepo(request));
        assertThrows(ResponseStatusException.class, () -> bond.repayRepo(request));
    }

    @Test void signedInWritesAreRefusedUntilTheyAreJournaled() {
        when(guard.verifiedMutationActor(request)).thenReturn(java.util.UUID.randomUUID());
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, new SeasonController(null, guard).claimReward(request).getStatusCode());
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, new MarketplaceController(null, guard).buyListing(request, "x").getStatusCode());
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, new BondController(null, guard).subscribe(request).getStatusCode());
    }
}
