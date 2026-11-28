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
 * and column names) to the caller. Integration 2026-11-26: submission and withdrawal now call the
 * database functions (MemberPhotoFunctionContractTest); the upload error check remains here.
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

    @Test void uploadFailureNeverEchoesTheInternalError() throws Exception {
        ImageStorageService storage = mock(ImageStorageService.class);
        when(storage.save(any())).thenThrow(new IllegalStateException("/srv/private/path disk full"));
        var response = controller(mock(JdbcTemplate.class), storage)
                .upload(new MockHttpServletRequest(), null, new byte[]{1, 2, 3});
        assertEquals(500, response.getStatusCode().value());
        assertFalse(String.valueOf(response.getBody()).contains("/srv/private/path"), "internal detail leaked");
    }
}
