package com.moneyverse.api.domain.work;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.work.controller.JobProfileController;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JobProfileTest {
    @Test void switchNeedsCsrfAndAValidJobBeforeTheDatabase() {
        MemberApiGuard guard = mock(MemberApiGuard.class);
        JdbcClient jdbc = mock(JdbcClient.class);
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(guard.verifiedMutationActor(req)).thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN));
        assertThrows(ResponseStatusException.class, () -> new JobProfileController(jdbc, guard).switchJob(req, Map.of("jobType", "miner")));
        reset(guard);
        when(guard.verifiedMutationActor(req)).thenReturn(java.util.UUID.randomUUID());
        assertThrows(ResponseStatusException.class, () -> new JobProfileController(jdbc, guard).switchJob(req, Map.of("jobType", "x'; drop")));
        verifyNoInteractions(jdbc);
    }

    @Test void directPaidCompletionStaysRefused() {
        assertEquals(409, new JobProfileController(mock(JdbcClient.class), mock(MemberApiGuard.class)).completeTask("x").getStatusCode().value());
    }
}
