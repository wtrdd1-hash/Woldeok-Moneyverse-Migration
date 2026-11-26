package com.moneyverse.api.domain.club;

import com.moneyverse.api.domain.club.controller.ClubReadController;
import com.moneyverse.api.domain.club.service.ClubReadService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * QA 2026-11-25: /clubs pages read /api/v1/clubs/** which Spring never mapped
 * (404). Reads come from the club tables (NestJS ClubRepository port). Club
 * creation and project contributions stay refused exactly as in NestJS: the DB
 * functions do not journal WLD, so no settlement may be acknowledged.
 */
class ClubReadContractTest {
    static final UUID ACTOR = UUID.fromString("00000000-0000-4000-8000-000000000123");
    static final UUID CLUB = UUID.fromString("44444444-4444-4444-8444-444444444444");
    final MemberApiGuard guard = mock(MemberApiGuard.class);
    final ClubReadService clubs = mock(ClubReadService.class);
    final HttpServletRequest request = mock(HttpServletRequest.class);
    final ClubReadController controller = new ClubReadController(clubs, guard);

    @Test void listIsOwnerAwareAndBounded() {
        when(guard.actor(request)).thenReturn(ACTOR);
        when(clubs.list(ACTOR, "길드", 50, 0)).thenReturn(List.of());
        assertEquals(Map.of("clubs", List.of()), controller.list(request, " 길드 ", null, null).getBody());
        assertEquals(HttpStatus.BAD_REQUEST, controller.list(request, null, "101", null).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.list(request, null, "x", null).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.list(request, null, null, "10001").getStatusCode());
    }

    @Test void missingOrMalformedClubIs404() {
        when(guard.actor(request)).thenReturn(ACTOR);
        when(clubs.get(CLUB, ACTOR)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND, controller.detail(request, CLUB.toString()).getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, controller.detail(request, "nope").getStatusCode());
    }

    @Test void unjournaledSettlementsAreRefusedWithoutTouchingTheDatabase() {
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, controller.create().getStatusCode());
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, controller.contribute().getStatusCode());
        assertEquals(Map.of("code", "CLUB_LEDGER_SETTLEMENT_UNAVAILABLE",
                "message", "Club WLD settlement is unavailable pending verified ledger and replay receipts"), controller.create().getBody());
        verifyNoInteractions(clubs);
    }

    @Test void databaseOutageIsUnavailableNeverAnEmptyList() {
        JdbcClient jdbc = mock(JdbcClient.class);
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        var e = assertThrows(ResponseStatusException.class, () -> new ClubReadService(jdbc).list(ACTOR, null, 50, 0));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, e.getStatusCode());
    }
}
