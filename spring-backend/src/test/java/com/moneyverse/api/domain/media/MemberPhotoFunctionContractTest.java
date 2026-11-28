package com.moneyverse.api.domain.media;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.media.controller.MemberPhotoController;
import com.moneyverse.api.domain.media.service.ImageStorageService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 2026-11-26: submission, withdrawal and the owner list wrote and read the photos table directly
 * (with values the schema rejects and a response shape the web client does not accept) although
 * migrations 098/297 already provide member_submit_photo, member_withdraw_pending_photo and
 * member_my_photo_submissions with exactly the contract the client validates (photo_id equal to
 * the idempotency key, replayed, submitted_at / withdrawn_at). The controller now calls them, and
 * writes require the session's CSRF proof.
 */
class MemberPhotoFunctionContractTest {
    private final UUID member = UUID.randomUUID();
    private final String csrf = "csrf-proof-123";

    private MemberPhotoController controller(JdbcTemplate jdbc) {
        UserAuthService auth = mock(UserAuthService.class);
        UserAuthService.SessionInfo session = mock(UserAuthService.SessionInfo.class);
        when(session.isSignedIn()).thenReturn(true);
        when(session.getUserId()).thenReturn(member);
        when(session.getCsrfHash()).thenReturn(UserAuthService.sha256(csrf));
        when(auth.resolveSession(any())).thenReturn(Optional.of(session));
        return new MemberPhotoController(mock(ImageStorageService.class), auth, jdbc);
    }

    private MockHttpServletRequest write(boolean withProof) {
        var r = new MockHttpServletRequest("POST", "/api/v1/photos");
        if (withProof) r.addHeader("X-CSRF-Token", csrf);
        return r;
    }

    @Test void submitCallsTheFunctionAndReturnsItsReceipt() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID key = UUID.randomUUID();
        Map<String, Object> row = Map.of("photo_id", key, "submitted_at", "2026-11-26T06:00:00Z", "replayed", false);
        when(jdbc.queryForList(contains("member_submit_photo"), any(Object[].class))).thenReturn(List.of(row));
        var response = controller(jdbc).submitPhoto(write(true),
                Map.of("storageKey", key + ".png", "altText", "caption", "idempotencyKey", key.toString()));
        assertEquals(201, response.getStatusCode().value());
        assertEquals(row, response.getBody());
        verify(jdbc).queryForList(contains("member_submit_photo"), eq(member), eq(key), eq(key + ".png"), eq("caption"));
        verify(jdbc, never()).update(anyString(), any(Object[].class));
    }

    @Test void submitWithoutTheCsrfProofIsRefused() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        var e = assertThrows(ResponseStatusException.class, () -> controller(jdbc).submitPhoto(write(false),
                Map.of("storageKey", "a.png", "altText", "x", "idempotencyKey", UUID.randomUUID().toString())));
        assertEquals(403, e.getStatusCode().value());
        verifyNoInteractions(jdbc);
    }

    @Test void withdrawCallsTheFunction() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID photo = UUID.randomUUID(), key = UUID.randomUUID();
        Map<String, Object> row = Map.of("photo_id", photo, "withdrawn_at", "2026-11-26T06:00:00Z", "replayed", false);
        when(jdbc.queryForList(contains("member_withdraw_pending_photo"), any(Object[].class))).thenReturn(List.of(row));
        var response = controller(jdbc).withdrawPhoto(write(true), Map.of("photoId", photo.toString(), "idempotencyKey", key.toString()));
        assertEquals(200, response.getStatusCode().value());
        assertEquals(row, response.getBody());
        verify(jdbc).queryForList(contains("member_withdraw_pending_photo"), eq(member), eq(photo), eq(key));
    }

    @Test void mineReturnsTheOwnerFunctionRows() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        List<Map<String, Object>> rows = List.of(Map.of("photo_id", UUID.randomUUID(), "published", false));
        when(jdbc.queryForList(contains("member_my_photo_submissions"), any(Object[].class))).thenReturn(rows);
        var response = controller(jdbc).mine(new MockHttpServletRequest("GET", "/api/v1/photos/mine"));
        assertEquals(Map.of("submissions", rows), response.getBody());
    }
}
