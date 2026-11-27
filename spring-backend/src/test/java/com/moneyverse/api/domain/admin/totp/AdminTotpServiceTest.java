package com.moneyverse.api.domain.admin.totp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.UncategorizedSQLException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.security.SecureRandom;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AdminTotpServiceTest {
    private static final long NOW = 1_800_000_015L;
    private static final byte[] SECRET = "12345678901234567890".getBytes();
    private final UUID actor = UUID.fromString("00000000-0000-4000-8000-00000000000a");
    private final UUID session = UUID.fromString("00000000-0000-4000-8000-0000000000aa");
    private JdbcTemplate jdbc;
    private TotpSecretSealer sealer;
    private AdminTotpService service;

    @BeforeEach void setUp() {
        jdbc = mock(JdbcTemplate.class);
        byte[] key = new byte[32];
        for (int i = 0; i < 32; i++) key[i] = (byte) (0x40 + i);
        sealer = new TotpSecretSealer(Base64.getEncoder().encodeToString(key), "test-k1");
        service = new AdminTotpService(jdbc, sealer, Clock.fixed(Instant.ofEpochSecond(NOW), ZoneOffset.UTC), new SecureRandom());
    }

    private void storedCredential(boolean confirmed, Instant lockedUntil) {
        when(jdbc.queryForList(contains("admin_totp_sealed_secret"), eq(actor))).thenReturn(List.of(Map.of(
                "secret_ciphertext", sealer.seal(actor, SECRET), "key_id", "test-k1", "confirmed", confirmed,
                "locked_until", lockedUntil == null ? "" : Timestamp.from(lockedUntil))));
    }

    private static UncategorizedSQLException sql(String state, String message) {
        return new UncategorizedSQLException("call", "sql", new SQLException(message, state));
    }

    private static String code(long epochSeconds) {
        return TotpCodec.code(SECRET, TotpCodec.stepAt(epochSeconds));
    }

    @Test void enrolmentSealsForTheActorAndNeverSendsTheClearSecret() {
        when(jdbc.queryForObject(contains("admin_totp_begin_enrolment"), eq(Boolean.class), any(), any(), any(), any())).thenReturn(false);
        Map<String, Object> out = service.beginEnrolment(actor, session);
        String uri = (String) out.get("otpauthUri");
        assertTrue(uri.startsWith("otpauth://totp/"));
        assertEquals("test-k1", out.get("keyId"));
        ArgumentCaptor<Object> args = ArgumentCaptor.forClass(Object.class);
        verify(jdbc).queryForObject(contains("admin_totp_begin_enrolment"), eq(Boolean.class), args.capture(), args.capture(), args.capture(), args.capture());
        String sealed = (String) args.getAllValues().get(2);
        String base32 = uri.replaceAll(".*secret=([A-Z2-7]+).*", "$1");
        assertFalse(sealed.contains(base32), "clear secret must not reach SQL");
        assertEquals(actor, args.getAllValues().get(0));
        assertEquals(session, args.getAllValues().get(1));
        // The sealed value opens only for this actor.
        assertEquals(base32, TotpCodec.base32(sealer.open(actor, "test-k1", sealed)));
    }

    @Test void confirmPassesTheMatchedStep() {
        storedCredential(false, null);
        when(jdbc.queryForObject(contains("admin_totp_confirm_enrolment"), eq(Boolean.class), any(), any(), any())).thenReturn(true);
        assertEquals(Map.of("confirmed", true), service.confirmEnrolment(actor, session, code(NOW - 30)));
        verify(jdbc).queryForObject(contains("admin_totp_confirm_enrolment"), eq(Boolean.class), eq(actor), eq(session), eq(TotpCodec.stepAt(NOW) - 1));
    }

    @Test void verifyMintsAProofForTheScope() {
        storedCredential(true, null);
        Timestamp expires = Timestamp.from(Instant.ofEpochSecond(NOW + 300));
        when(jdbc.queryForObject(contains("admin_totp_verify"), eq(Timestamp.class), any(), any(), any(), any())).thenReturn(expires);
        Map<String, Object> out = service.verify(actor, session, "economy.treasury", code(NOW));
        assertEquals("economy.treasury", out.get("scope"));
        assertEquals(expires.toInstant().toString(), out.get("expiresAt"));
        verify(jdbc).queryForObject(contains("admin_totp_verify"), eq(Timestamp.class), eq(actor), eq(session), eq("economy.treasury"), eq(TotpCodec.stepAt(NOW)));
    }

    @Test void wrongCodeRecordsAFailureAndDoesNotVerify() {
        storedCredential(true, null);
        when(jdbc.queryForList(contains("admin_totp_record_failure"), eq(actor), eq(session))).thenReturn(List.of(Map.of("failed_attempts", 1)));
        String wrong = code(NOW).equals("000000") ? "111111" : "000000";
        var failure = assertThrows(AdminTotpService.Failure.class, () -> service.verify(actor, session, "economy.treasury", wrong));
        assertEquals(401, failure.status);
        assertEquals("invalid_code", failure.code);
        verify(jdbc).queryForList(contains("admin_totp_record_failure"), eq(actor), eq(session));
        verify(jdbc, never()).queryForObject(contains("admin_totp_verify"), any(Class.class), any(), any(), any(), any());
    }

    @Test void sessionCeilingAnswersTooManyAttempts() {
        storedCredential(true, null);
        when(jdbc.queryForList(contains("admin_totp_record_failure"), eq(actor), eq(session)))
                .thenThrow(sql("55000", "too many second factor attempts from this session"));
        var failure = assertThrows(AdminTotpService.Failure.class, () -> service.verify(actor, session, "economy.treasury", "000001"));
        assertEquals(429, failure.status);
    }

    @Test void replayedStepAnswersConflict() {
        storedCredential(true, null);
        when(jdbc.queryForObject(contains("admin_totp_verify"), eq(Timestamp.class), any(), any(), any(), any()))
                .thenThrow(sql("23505", "authentication code was already used"));
        var failure = assertThrows(AdminTotpService.Failure.class, () -> service.verify(actor, session, "economy.treasury", code(NOW)));
        assertEquals(409, failure.status);
        assertEquals("code_already_used", failure.code);
    }

    @Test void lockedFactorIsRefusedWithoutSpendingAnAttempt() {
        storedCredential(true, Instant.ofEpochSecond(NOW + 600));
        var failure = assertThrows(AdminTotpService.Failure.class, () -> service.verify(actor, session, "economy.treasury", code(NOW)));
        assertEquals(423, failure.status);
        verify(jdbc, never()).queryForList(contains("admin_totp_record_failure"), (Object) any(), (Object) any());
    }

    @Test void notEnrolledIsAConflict() {
        when(jdbc.queryForList(contains("admin_totp_sealed_secret"), eq(actor))).thenReturn(List.of());
        var failure = assertThrows(AdminTotpService.Failure.class, () -> service.verify(actor, session, "economy.treasury", "123456"));
        assertEquals(409, failure.status);
        assertEquals("not_enrolled", failure.code);
    }

    @Test void unknownScopeIsRefusedBeforeAnySql() {
        var failure = assertThrows(AdminTotpService.Failure.class, () -> service.verify(actor, session, "everything", "123456"));
        assertEquals(400, failure.status);
        verifyNoInteractions(jdbc);
    }

    @Test void unavailableSealerRefusesBeforeAnySql() {
        var off = new AdminTotpService(jdbc, new TotpSecretSealer("", ""), Clock.systemUTC(), new SecureRandom());
        for (var call : List.<org.junit.jupiter.api.function.Executable>of(
                () -> off.beginEnrolment(actor, session),
                () -> off.confirmEnrolment(actor, session, "123456"),
                () -> off.verify(actor, session, "economy.treasury", "123456"))) {
            var failure = assertThrows(AdminTotpService.Failure.class, call);
            assertEquals(503, failure.status);
            assertEquals("totp_unavailable", failure.code);
        }
        verifyNoInteractions(jdbc);
    }

    @Test void roleRefusalIsForbidden() {
        when(jdbc.queryForObject(contains("admin_totp_revoke"), eq(Boolean.class), any(), any(), any()))
                .thenThrow(sql("42501", "superadmin role required"));
        var failure = assertThrows(AdminTotpService.Failure.class, () -> service.revoke(actor, session, UUID.randomUUID()));
        assertEquals(403, failure.status);
    }

    @Test void statusReportsAvailability() {
        when(jdbc.queryForList(contains("admin_totp_requirement"), eq(actor))).thenReturn(List.of(Map.of("enrolled", true, "enforced", true)));
        assertEquals(Map.of("enrolled", true, "enforced", true, "available", true), service.status(actor));
    }

    @Test void malformedCodeIsAFailedAttempt() {
        storedCredential(true, null);
        when(jdbc.queryForList(contains("admin_totp_record_failure"), eq(actor), eq(session))).thenReturn(List.of(Map.of("failed_attempts", 1)));
        assertEquals(401, assertThrows(AdminTotpService.Failure.class, () -> service.verify(actor, session, "economy.treasury", "12ab56")).status);
    }
}
