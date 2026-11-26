package com.moneyverse.api.domain.activity;

import com.moneyverse.api.domain.activity.controller.ActivityController;
import com.moneyverse.api.domain.activity.dto.ActivityDtos.*;
import com.moneyverse.api.domain.activity.service.ActivityService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Security review 2026-11-25: public activity ingest took the member from an X-User-Id header
 * (anyone could write another member's activity, which feeds the admin traffic dashboard and the
 * member's own account summary) and accepted an unbounded event list. The Next BFF forwards only
 * the session cookie, so real members were recorded as anonymous.
 */
class ActivityIngestIdentityTest {
    final ActivityService service = mock(ActivityService.class);
    final UserAuthService auth = mock(UserAuthService.class);
    final HttpServletRequest request = mock(HttpServletRequest.class);
    final ActivityController controller = new ActivityController(service, auth);
    static final IngestActivityEventsRequest ONE = new IngestActivityEventsRequest(List.of(new IngestEventItem("page_view", "/", null, 10, null)));

    @Test void aForgedHeaderWithoutASessionIsRecordedAsAnonymous() {
        when(auth.resolveSession(any())).thenReturn(Optional.empty());
        when(service.recordEvents(any(), anyList(), any(), any())).thenReturn(new IngestEventsResponse(true, 1));
        controller.ingestEvents(ONE, "00000000-0000-4000-8000-000000000999", null, request);
        verify(service).recordEvents(isNull(), anyList(), any(), any());
    }

    @Test void theSessionMemberIsRecorded() {
        var s = new UserAuthService.SessionInfo();
        UUID me = UUID.fromString("00000000-0000-4000-8000-000000000123");
        s.setUserId(me);
        when(auth.resolveSession(any())).thenReturn(Optional.of(s));
        when(service.recordEvents(any(), anyList(), any(), any())).thenReturn(new IngestEventsResponse(true, 1));
        controller.ingestEvents(ONE, "00000000-0000-4000-8000-000000000999", null, request);
        verify(service).recordEvents(eq(me), anyList(), any(), any());
    }

    @Test void anOversizedBatchIsRefused() {
        when(auth.resolveSession(any())).thenReturn(Optional.empty());
        var many = new IngestActivityEventsRequest(Collections.nCopies(ActivityController.MAX_EVENTS + 1, new IngestEventItem("page_view", "/", null, 1, null)));
        assertEquals(HttpStatus.BAD_REQUEST, controller.ingestEvents(many, null, null, request).getStatusCode());
        verifyNoInteractions(service);
    }
}
