package com.moneyverse.api.domain.identity.service;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.util.UUID;

/** Policy acknowledgement, ported from the NestJS SessionRepository. */
@Service
public class ConsentService {
    private final JdbcClient jdbc;

    public ConsentService(JdbcClient jdbc) { this.jdbc = jdbc; }

    /** Signed-in session: the DB function checks the versions are the current published ones. */
    public boolean grantMember(UUID session, String termsVersion, String privacyVersion) {
        return Boolean.TRUE.equals(jdbc.sql("SELECT public.auth_grant_current_user_consent(?::uuid, ?::text, ?::text)")
                .param(session).param(termsVersion).param(privacyVersion).query(Boolean.class).single());
    }

    /** Pre-login session: recorded only against a published policy version, before the provider step. */
    public boolean grantPrelogin(UUID session, String termsVersion, String privacyVersion) {
        return jdbc.sql("""
                WITH current_version AS (
                  SELECT id FROM consent_versions
                  WHERE published_at <= now() AND terms_version = ? AND privacy_version = ?
                  ORDER BY published_at DESC, id DESC LIMIT 1)
                UPDATE auth_sessions s
                SET prelogin_consent_version_id = current_version.id,
                    prelogin_age_confirmed = true,
                    prelogin_consented_at = now()
                FROM current_version
                WHERE s.id = ?::uuid AND s.user_id IS NULL AND s.revoked_at IS NULL AND s.expires_at > now()
                """).param(termsVersion).param(privacyVersion).param(session).update() == 1;
    }
}
