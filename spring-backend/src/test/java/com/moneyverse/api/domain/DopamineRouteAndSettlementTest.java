package com.moneyverse.api.domain;

import com.moneyverse.api.domain.engagement.controller.DopamineController;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DopamineRouteAndSettlementTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void anonymousForgedUserHeaderCannotReadDopamineStatus() throws Exception {
        mockMvc.perform(get("/api/engagement/dopamine/status")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/engagement/dopamine/status"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedSpinCannotClaimWldWithoutLedgerReceipt() {
        UserAuthService auth = mock(UserAuthService.class);
        UserAuthService.SessionInfo session = new UserAuthService.SessionInfo();
        session.setUserId(UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20"));
        when(auth.resolveSession(any(HttpServletRequest.class))).thenReturn(Optional.of(session));

        DopamineController controller = new DopamineController();
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.spinDailyRoulette(mock(HttpServletRequest.class)));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
    }

    @Test
    void authenticatedStatusCannotClaimUnverifiedDailySpins() {
        UserAuthService auth = mock(UserAuthService.class);
        UserAuthService.SessionInfo session = new UserAuthService.SessionInfo();
        session.setUserId(UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20"));
        when(auth.resolveSession(any(HttpServletRequest.class))).thenReturn(Optional.of(session));

        DopamineController controller = new DopamineController();
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.getDopamineStatus(mock(HttpServletRequest.class)));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
    }

    @Test
    void authenticatedStreakCannotClaimUnverifiedWldMilestones() {
        UserAuthService auth = mock(UserAuthService.class);
        UserAuthService.SessionInfo session = new UserAuthService.SessionInfo();
        session.setUserId(UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20"));
        when(auth.resolveSession(any(HttpServletRequest.class))).thenReturn(Optional.of(session));

        DopamineController controller = new DopamineController();
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.getStreakBonus(mock(HttpServletRequest.class)));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
    }

    @Test
    void anonymousSpinRequiresSession() {
        UserAuthService auth = mock(UserAuthService.class);
        when(auth.resolveSession(any(HttpServletRequest.class))).thenReturn(Optional.empty());
        DopamineController controller = new DopamineController();
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.spinDailyRoulette(mock(HttpServletRequest.class)));
        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
    }
}
