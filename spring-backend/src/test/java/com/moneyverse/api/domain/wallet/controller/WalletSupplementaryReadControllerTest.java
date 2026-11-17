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

class WalletSupplementaryReadControllerTest {
    @Test
    void anonymousMayNotReadLoansOrRewardsEvenIfTheyForgeUserHeader() {
        UserAuthService auth = mock(UserAuthService.class);
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("X-User-Id")).thenReturn(UUID.randomUUID().toString());
        when(auth.resolveSession(request)).thenReturn(Optional.empty());
        var subject = new WalletSupplementaryReadController(auth, jdbc);
        assertThatThrownBy(() -> subject.loans(request))
            .isInstanceOfSatisfying(ResponseStatusException.class,
                exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));
        assertThatThrownBy(() -> subject.availability(request))
            .isInstanceOfSatisfying(ResponseStatusException.class,
                exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));
        verifyNoInteractions(jdbc);
    }

    @Test
    void loanReadIsOwnerBoundAndDoesNotPretendMissingDatabaseIsEmpty() {
        UserAuthService auth = mock(UserAuthService.class);
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        UUID owner = UUID.randomUUID();
        SessionInfo session = new SessionInfo();
        session.setUserId(owner);
        when(auth.resolveSession(request)).thenReturn(Optional.of(session));
        when(jdbc.queryForList(contains("bank_my_loans"), eq(owner))).thenReturn(List.of());
        var subject = new WalletSupplementaryReadController(auth, jdbc);
        assertThat(subject.loans(request).getBody()).containsEntry("loans", List.of());
        when(jdbc.queryForList(contains("wallet_reward_availability"), eq(owner)))
            .thenReturn(List.of(Map.of("daily_available", true, "work_available", false)));
        assertThat(subject.availability(request).getBody())
            .containsEntry("dailyAvailable", true).containsEntry("workAvailable", false);
    }
}
