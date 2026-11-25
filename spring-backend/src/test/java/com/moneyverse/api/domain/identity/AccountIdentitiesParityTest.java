package com.moneyverse.api.domain.identity;

import com.moneyverse.api.domain.admin.service.EncryptionService;
import com.moneyverse.api.domain.identity.controller.AccountController;
import com.moneyverse.api.domain.identity.service.ProfileService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * QA 2026-11-25 (owner report §2.5): a Discord/Google member saw
 * "연결된 로그인 수단 0개" because listIdentities only read local credentials.
 */
class AccountIdentitiesParityTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final UserAuthService auth = mock(UserAuthService.class);
    private final EncryptionService enc = mock(EncryptionService.class);
    private final AccountController controller = new AccountController(auth, mock(ProfileService.class), jdbc, enc);
    private final HttpServletRequest req = mock(HttpServletRequest.class);

    private void signedIn() {
        UserAuthService.SessionInfo s = mock(UserAuthService.SessionInfo.class);
        when(s.isSignedIn()).thenReturn(true);
        when(s.getUserId()).thenReturn(UUID.randomUUID());
        when(auth.resolveSession(req)).thenReturn(Optional.of(s));
    }

    @Test void readsEveryLinkedIdentityFromTheDatabaseFunction() {
        signedIn();
        when(jdbc.query(contains("public.account_list_my_identities"), any(RowMapper.class), any(Object[].class)))
                .thenReturn(List.of(Map.of("identityId", "x", "provider", "discord", "displayName", "월덕", "linkedAt", "2026-11-24T00:00:00Z")));
        ResponseEntity<?> res = controller.listIdentities(req);
        assertEquals(200, res.getStatusCode().value());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> ids = (List<Map<String, Object>>) ((Map<String, Object>) res.getBody()).get("identities");
        assertEquals("discord", ids.get(0).get("provider"));
        verify(jdbc, never()).query(contains("auth_local_credentials"), any(RowMapper.class), any(Object[].class));
    }

    @Test void databaseFailureIsUnavailableNotZeroIdentities() {
        signedIn();
        when(jdbc.query(anyString(), any(RowMapper.class), any(Object[].class))).thenThrow(new IllegalStateException("offline"));
        assertEquals(503, controller.listIdentities(req).getStatusCode().value());
    }
}
