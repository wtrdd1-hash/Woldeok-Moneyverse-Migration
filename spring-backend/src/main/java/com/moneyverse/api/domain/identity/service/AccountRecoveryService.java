package com.moneyverse.api.domain.identity.service;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.util.UUID;

/** Local password reset and login-email change through the auth_* DB functions (NestJS LocalAuthRepository port). */
@Service
public class AccountRecoveryService {
    private final JdbcClient jdbc;
    private final UserAuthService auth;

    public AccountRecoveryService(JdbcClient jdbc, UserAuthService auth) {
        this.jdbc = jdbc;
        this.auth = auth;
    }

    /** @param email normalized address; @param tokenHash sha256 of the raw token that is mailed. */
    public boolean startPasswordReset(String email, String tokenHash) {
        return bool(jdbc.sql("SELECT public.auth_start_local_password_reset(?::text, ?::text)")
                .param(UserAuthService.sha256(email)).param(tokenHash).query(Boolean.class).single());
    }

    public boolean completePasswordReset(String rawToken, String newPassword) {
        return bool(jdbc.sql("SELECT public.auth_complete_local_password_reset(?::text, ?::text)")
                .param(UserAuthService.sha256(rawToken)).param(auth.encodePassword(newPassword)).query(Boolean.class).single());
    }

    public boolean startEmailChange(UUID session, UUID user, String email, String tokenHash) {
        return bool(jdbc.sql("SELECT public.auth_start_local_email_change(?::uuid, ?::uuid, ?::text, ?::text, ?::text)")
                .param(session).param(user).param(email).param(UserAuthService.sha256(email)).param(tokenHash).query(Boolean.class).single());
    }

    public boolean completeEmailChange(String rawToken) {
        return bool(jdbc.sql("SELECT public.auth_complete_local_email_change(?::text)")
                .param(UserAuthService.sha256(rawToken)).query(Boolean.class).single());
    }

    private static boolean bool(Boolean value) { return Boolean.TRUE.equals(value); }
}
