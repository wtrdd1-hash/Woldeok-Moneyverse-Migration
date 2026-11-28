package com.moneyverse.api.domain.admin.totp;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;

import java.net.URI;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.DriverManager;
import java.time.Clock;
import java.util.Base64;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Real 366 functions through the service, as moneyverse_app; disposable CI only, every fixture rolled back. */
@Tag("postgres-totp")
class AdminTotpPostgresIntegrationTest {
    Connection connection;
    JdbcTemplate jdbc;
    AdminTotpService service;
    TotpSecretSealer sealer;
    UUID admin, member, adminSession, otherSession, memberSession;

    @BeforeEach void disposableFixture() throws Exception {
        assertEquals("true", System.getenv("GITHUB_ACTIONS"), "Disposable GitHub CI is required");
        String url = System.getenv("MONEYVERSE_MESSAGING_PG_TEST_URL");
        assertNotNull(url);
        assertTrue(url.startsWith("jdbc:postgresql://"));
        URI uri = URI.create(url.substring(5));
        assertTrue(Set.of("127.0.0.1", "localhost").contains(uri.getHost()));
        assertEquals("/woldeok_moneyverse_dev", uri.getPath());
        assertNull(uri.getUserInfo());
        assertNull(uri.getQuery());
        String user = System.getenv("MONEYVERSE_MESSAGING_PG_TEST_USER"), password = System.getenv("MONEYVERSE_MESSAGING_PG_TEST_PASSWORD");
        assertNotNull(user);
        assertNotNull(password);
        connection = DriverManager.getConnection(url, user, password);
        connection.setAutoCommit(false);
        jdbc = new JdbcTemplate(new SingleConnectionDataSource(connection, true));
        admin = UUID.randomUUID(); member = UUID.randomUUID();
        adminSession = UUID.randomUUID(); otherSession = UUID.randomUUID(); memberSession = UUID.randomUUID();
        jdbc.update("INSERT INTO public.users(id) VALUES (?::uuid),(?::uuid)", admin, member);
        jdbc.update("INSERT INTO public.user_roles(user_id, role) VALUES (?::uuid, 'superadmin')", admin);
        for (UUID[] s : new UUID[][]{{adminSession, admin}, {otherSession, admin}, {memberSession, member}}) {
            jdbc.update("INSERT INTO public.auth_sessions(id, token_hash, csrf_hash, user_id, expires_at, reauthenticated_at) "
                    + "VALUES (?::uuid, md5(random()::text) || md5(random()::text), md5(random()::text), ?::uuid, now() + interval '1 hour', now())",
                    s[0], s[1]);
        }
        jdbc.execute("SET LOCAL ROLE moneyverse_app");
        assertEquals("moneyverse_app", jdbc.queryForObject("SELECT current_user", String.class));
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key); // synthetic, per test run
        sealer = new TotpSecretSealer(Base64.getEncoder().encodeToString(key), "ci-k1");
        service = new AdminTotpService(jdbc, sealer, Clock.systemUTC(), new SecureRandom());
    }

    @AfterEach void rollbackFixture() throws Exception {
        if (connection != null) try { connection.rollback(); } finally { connection.close(); }
    }

    private byte[] enrolAndConfirm() {
        String uri = (String) service.beginEnrolment(admin, adminSession).get("otpauthUri");
        var row = jdbc.queryForMap("SELECT pending_ciphertext, pending_key_id FROM public.admin_totp_sealed_secret(?::uuid)", admin);
        byte[] secret = sealer.open(admin, (String) row.get("pending_key_id"), (String) row.get("pending_ciphertext"));
        assertTrue(uri.contains("secret=" + TotpCodec.base32(secret)));
        long now = System.currentTimeMillis() / 1000;
        service.confirmEnrolment(admin, adminSession, TotpCodec.code(secret, TotpCodec.stepAt(now) - 1));
        return secret;
    }

    @Test void enrolledAdministratorVerifiesAndTheProofIsSessionAndScopeBound() {
        byte[] secret = enrolAndConfirm();
        String code = TotpCodec.code(secret, TotpCodec.stepAt(System.currentTimeMillis() / 1000));
        assertEquals("economy.treasury", service.verify(admin, adminSession, "economy.treasury", code).get("scope"));
        String q = "SELECT public.admin_totp_proof_valid(?::uuid, ?::uuid, ?)";
        assertEquals(Boolean.TRUE, jdbc.queryForObject(q, Boolean.class, admin, adminSession, "economy.treasury"));
        assertEquals(Boolean.FALSE, jdbc.queryForObject(q, Boolean.class, admin, otherSession, "economy.treasury"));
        assertEquals(Boolean.FALSE, jdbc.queryForObject(q, Boolean.class, admin, adminSession, "backup.restore"));
    }

    @Test void theSameCodeCannotBeSpentTwice() {
        byte[] secret = enrolAndConfirm();
        String code = TotpCodec.code(secret, TotpCodec.stepAt(System.currentTimeMillis() / 1000));
        service.verify(admin, adminSession, "economy.treasury", code);
        var replay = assertThrows(AdminTotpService.Failure.class, () -> service.verify(admin, otherSession, "backup.restore", code));
        assertEquals(409, replay.status);
    }

    @Test void aReplacementKeepsTheActiveFactorUntilConfirmed() {
        byte[] secret = enrolAndConfirm();
        long now = System.currentTimeMillis() / 1000;
        service.verify(admin, adminSession, "totp.manage", TotpCodec.code(secret, TotpCodec.stepAt(now)));
        service.beginEnrolment(admin, adminSession);
        var requirement = jdbc.queryForMap("SELECT enrolled, enforced FROM public.admin_totp_requirement(?::uuid)", admin);
        assertEquals(Boolean.TRUE, requirement.get("enrolled"));
        assertEquals(Boolean.TRUE, requirement.get("enforced"));
        // The old secret still verifies while the replacement is pending.
        assertEquals("economy.treasury", service.verify(admin, otherSession, "economy.treasury",
                TotpCodec.code(secret, TotpCodec.stepAt(now) + 1)).get("scope"));
    }

    @Test void aMemberCannotEnrol() {
        var failure = assertThrows(AdminTotpService.Failure.class, () -> service.beginEnrolment(member, memberSession));
        assertEquals(403, failure.status);
    }

    @Test void theApplicationRoleCannotReadTheTables() {
        for (String table : new String[]{"admin_totp_credentials", "admin_totp_proofs", "admin_totp_attempts"})
            assertEquals(Boolean.FALSE, jdbc.queryForObject("SELECT has_table_privilege(current_user, ?, 'SELECT')", Boolean.class, "public." + table));
    }
}
