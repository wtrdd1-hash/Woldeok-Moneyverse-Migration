package com.moneyverse.api.domain.identity;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class UserAuthLeastPrivilegeRegressionTest {
    private static final UUID MEMBER = UUID.fromString("8dc4f0a1-6262-4520-87a3-ff6ff8d792fb");
    private static final UUID SESSION = UUID.fromString("23abfb89-5d0c-4f7b-a2cd-91636bed1ca7");

    @Test
    @SuppressWarnings("unchecked")
    void activeSignedInSuperadminCanResolveThroughOnlyGrantedTablesAndFunctions() throws Exception {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForObject(anyString(), any(RowMapper.class), any(Object.class))).thenAnswer(inv -> {
            String sql = inv.getArgument(0);
            if (sql.toLowerCase().contains("join users") || sql.toLowerCase().contains("join public.users")) {
                throw new BadSqlGrammarException("test",sql,new java.sql.SQLException("permission denied"));
            }
            ResultSet rs = mock(ResultSet.class);
            when(rs.getString("id")).thenReturn(SESSION.toString());
            when(rs.getString("user_id")).thenReturn(MEMBER.toString());
            when(rs.getString("csrf_hash")).thenReturn("test-hash");
            when(rs.getTimestamp("expires_at")).thenReturn(Timestamp.from(Instant.now().plusSeconds(120)));
            when(rs.getTimestamp("reauthenticated_at")).thenReturn(Timestamp.from(Instant.now()));
            return ((RowMapper<?>)inv.getArgument(1)).mapRow(rs,0);
        });
        when(jdbc.query(anyString(), any(RowMapper.class), any(Object.class))).thenAnswer(inv -> {
            String sql=inv.getArgument(0);
            if (!sql.contains("admin_current_roles(")) {
                throw new BadSqlGrammarException("test",sql,new java.sql.SQLException("permission denied"));
            }
            return List.of("superadmin");
        });

        HttpServletRequest request=mock(HttpServletRequest.class);
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("mv_session","synthetic-only-token")});
        UserAuthService service = new UserAuthService(jdbc);
        Optional<UserAuthService.SessionInfo> active=service.resolveSession(request);
        assertTrue(active.isPresent(), "signed-in session cannot require direct users/user_roles SELECT");
        assertTrue(active.get().isSignedIn());
        assertEquals(MEMBER,active.get().getUserId());
        assertTrue(active.get().getRoles().stream().anyMatch("superadmin"::equalsIgnoreCase));
        verify(jdbc).queryForObject(anyString(),any(RowMapper.class),eq(UserAuthService.sha256("synthetic-only-token")));
    }

    @Test
    void databaseAdminRoleFunctionIsTheOnlySourceOfElevatedRole() {
        JdbcTemplate jdbc=mock(JdbcTemplate.class);
        when(jdbc.query(anyString(),any(RowMapper.class),eq(MEMBER))).thenAnswer(inv -> {
            String sql=inv.getArgument(0);
            if (sql.contains("admin_current_roles(")) return List.of("superadmin");
            throw new BadSqlGrammarException("test",sql,new java.sql.SQLException("permission denied"));
        });
        assertTrue(new UserAuthService(jdbc).findUserRoles(MEMBER).contains("superadmin"));
    }

    @Test
    void noUnverifiedPrivilegeOnFailedRoleLookup() {
        JdbcTemplate jdbc=mock(JdbcTemplate.class);
        when(jdbc.query(anyString(),any(RowMapper.class),any(Object.class)))
                .thenThrow(new BadSqlGrammarException("test","missing",new java.sql.SQLException("denied")));
        assertFalse(new UserAuthService(jdbc).findUserRoles(MEMBER).contains("superadmin"));
    }
}
