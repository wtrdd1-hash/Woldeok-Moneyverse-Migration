package com.moneyverse.api.domain.enterprise;

import com.moneyverse.api.domain.enterprise.controller.EnterpriseController;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EnterpriseTruthTest {
    private final UserAuthService auth=mock(UserAuthService.class);
    private final EnterpriseController enterprise=new EnterpriseController(auth);
    private MockHttpServletRequest request() {
        UserAuthService.SessionInfo session=new UserAuthService.SessionInfo();
        session.setUserId(UUID.randomUUID());session.setRoles(List.of("superadmin"));
        when(auth.resolveSession(any())).thenReturn(Optional.of(session));
        return new MockHttpServletRequest("GET","/api/v1/admin/enterprises");
    }

    @Test void staticStateOwnedEnterpriseLedgerIsNotPretendedReal() {
        assertEquals(503,assertThrows(ResponseStatusException.class,
                ()->enterprise.listEnterprises(request())).getStatusCode().value());
    }
    @Test void privatizationWithoutActualLedgerMutationCannotClaimSuccess() {
        assertEquals(503,assertThrows(ResponseStatusException.class,
                ()->enterprise.privatizeShares(request(),"synthetic",Map.of("sharesToOfferPercent",10))).getStatusCode().value());
    }
    @Test void dividendWithoutAccountingReceiptCannotClaimDisbursed() {
        assertEquals(503,assertThrows(ResponseStatusException.class,
                ()->enterprise.disburseDividends(request(),"synthetic")).getStatusCode().value());
    }
    @Test void inventedBoardSeatsAndTripleARatingCannotBeDisplayedAsActual() {
        assertEquals(503,assertThrows(ResponseStatusException.class,
                ()->enterprise.getGovernance(request(),"synthetic")).getStatusCode().value());
    }
}
