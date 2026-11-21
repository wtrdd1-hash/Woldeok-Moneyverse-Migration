package com.moneyverse.api.domain.admin;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties="moneyverse.security.internal-token=synthetic-network-token-for-regression-only")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminInternalCredentialRegressionTest {
    @Autowired AdminAuthService auth;
    @Autowired MockMvc mvc;
    static final String NETWORK_CREDENTIAL="synthetic-network-token-for-regression-only";
    MockHttpServletRequest transportOnly() {
        var request=new MockHttpServletRequest();request.addHeader("x-internal-token",NETWORK_CREDENTIAL);return request;
    }
    @Test void networkCredentialDoesNotAuthorizeAHumanAdministrator() {
        assertFalse(auth.isAuthorizedAdmin(transportOnly()));
    }
    @Test void networkCredentialCannotInventAnAdministratorActor() {
        assertTrue(auth.resolveVerifiedAdminActor(transportOnly()).isEmpty());
    }
    @Test void networkCredentialIsNotAUserBoundCsrfProof() {
        assertFalse(auth.hasVerifiedSessionCsrf(transportOnly()));
    }
    @Test void bearerNetworkCredentialAlsoRequiresAnActualAdministratorSession() {
        var request=new MockHttpServletRequest();request.addHeader("Authorization","Bearer "+NETWORK_CREDENTIAL);
        assertFalse(auth.isAuthorizedAdmin(request));
    }
    @Test void actualAdminApiBoundaryRefusesTransportOnlyRequests() throws Exception {
        mvc.perform(get("/api/v1/admin/controls").header("x-internal-token",NETWORK_CREDENTIAL))
            .andExpect(status().isUnauthorized());
    }
}
