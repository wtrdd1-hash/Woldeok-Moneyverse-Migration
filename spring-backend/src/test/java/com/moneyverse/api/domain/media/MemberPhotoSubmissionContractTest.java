package com.moneyverse.api.domain.media;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.media.controller.MemberPhotoController;
import com.moneyverse.api.domain.media.service.ImageStorageService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 2026-11-26: submission wrote 'PRIVATE'/'DRAFT' while photos only accepts lowercase
 * ('photos_content_state_check', 'photos_visibility_check'), so every submission failed and
 * every withdrawal matched nothing; the failure then echoed the database message (constraint
 * and column names) to the caller. Values now match the schema and errors are generic.
 */
class MemberPhotoSubmissionContractTest {
    private static final String LEAK = "violates check constraint \"photos_content_state_check\"";
    private final UUID member = UUID.randomUUID();

    private MemberPhotoController controller(JdbcTemplate jdbc, ImageStorageService storage) {
        UserAuthService auth = mock(UserAuthService.class);
        UserAuthService.SessionInfo session = mock(UserAuthService.SessionInfo.class);
        when(session.isSignedIn()).thenReturn(true);
        when(session.getUserId()).thenReturn(member);
        when(auth.resolveSession(any())).thenReturn(Optional.of(session));
        return new MemberPhotoController(storage, auth, jdbc);
    }

    @Test void submissionUsesTheSchemaValuesAndNeverEchoesTheDatabaseError() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.update(anyString(), any(Object[].class))).thenThrow(new DataIntegrityViolationException(LEAK));
        var response = controller(jdbc, mock(ImageStorageService.class))
                .submitPhoto(new MockHttpServletRequest(), Map.of("storageKey", "abc.jpg"));
        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        verify(jdbc).update(sql.capture(), any(Object[].class));
        assertTrue(sql.getValue().contains("'private'") && sql.getValue().contains("'draft'"), sql.getValue());
        assertFalse(sql.getValue().contains("'PRIVATE'") || sql.getValue().contains("'DRAFT'"));
        assertFalse(String.valueOf(response.getBody()).contains("photos_content_state_check"), "database detail leaked");
    }

    @Test void withdrawalMatchesLowercaseDraft() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        controller(jdbc, mock(ImageStorageService.class))
                .withdrawPhoto(new MockHttpServletRequest(), Map.of("photoId", UUID.randomUUID().toString()));
        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        verify(jdbc).update(sql.capture(), any(Object[].class));
        assertTrue(sql.getValue().contains("content_state = 'draft'"), sql.getValue());
    }

    @Test void uploadFailureNeverEchoesTheInternalError() throws Exception {
        ImageStorageService storage = mock(ImageStorageService.class);
        when(storage.save(any())).thenThrow(new IllegalStateException("/srv/private/path disk full"));
        var response = controller(mock(JdbcTemplate.class), storage)
                .upload(new MockHttpServletRequest(), null, new byte[]{1, 2, 3});
        assertEquals(500, response.getStatusCode().value());
        assertFalse(String.valueOf(response.getBody()).contains("/srv/private/path"), "internal detail leaked");
    }
}
