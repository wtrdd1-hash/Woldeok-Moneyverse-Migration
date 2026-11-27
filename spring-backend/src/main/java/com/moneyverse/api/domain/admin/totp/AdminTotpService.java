package com.moneyverse.api.domain.admin.totp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Clock;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalLong;
import java.util.UUID;

/**
 * Administrator TOTP (migration 366). This class holds the key and decides whether a code
 * matches; the database functions decide everything else (step plausibility, replay, lockout,
 * proofs). The clear secret exists only in memory here, is returned once inside the enrolment
 * URI, and is never logged.
 */
@Service
public class AdminTotpService {
    static final String ISSUER = "Woldeok Moneyverse";

    /** An expected refusal with its HTTP status and a stable machine-readable code. */
    public static final class Failure extends RuntimeException {
        public final int status;
        public final String code;

        Failure(int status, String code) {
            super(code, null, false, false);
            this.status = status;
            this.code = code;
        }
    }

    private final JdbcTemplate jdbc;
    private final TotpSecretSealer sealer;
    private final Clock clock;
    private final SecureRandom random;

    @Autowired
    public AdminTotpService(JdbcTemplate jdbc, TotpSecretSealer sealer) {
        this(jdbc, sealer, Clock.systemUTC(), new SecureRandom());
    }

    AdminTotpService(JdbcTemplate jdbc, TotpSecretSealer sealer, Clock clock, SecureRandom random) {
        this.jdbc = jdbc;
        this.sealer = sealer;
        this.clock = clock;
        this.random = random;
    }

    public Map<String, Object> status(UUID actor) {
        List<Map<String, Object>> rows = call(() -> jdbc.queryForList(
                "SELECT enrolled, enforced FROM public.admin_totp_requirement(?::uuid)", actor));
        Map<String, Object> row = rows.isEmpty() ? Map.of() : rows.get(0);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("enrolled", Boolean.TRUE.equals(row.get("enrolled")));
        out.put("enforced", !Boolean.FALSE.equals(row.get("enforced")));
        out.put("available", sealer.available());
        return out;
    }

    public Map<String, Object> beginEnrolment(UUID actor, UUID session) {
        requireAvailable();
        byte[] secret = TotpCodec.newSecret(random);
        try {
            String sealed = sealer.seal(actor, secret);
            call(() -> jdbc.queryForObject("SELECT public.admin_totp_begin_enrolment(?::uuid, ?::uuid, ?, ?)",
                    Boolean.class, actor, session, sealed, sealer.keyId()));
            // The account label carries no personal data: a short prefix of the actor id.
            String uri = TotpCodec.otpauthUri(ISSUER, "admin-" + actor.toString().substring(0, 8), secret);
            Map<String, Object> out = new LinkedHashMap<>();
            out.put("otpauthUri", uri);
            out.put("keyId", sealer.keyId());
            return out;
        } finally {
            Arrays.fill(secret, (byte) 0);
        }
    }

    public Map<String, Object> confirmEnrolment(UUID actor, UUID session, String code) {
        requireAvailable();
        long step = matchOrFail(actor, session, code, false);
        call(() -> jdbc.queryForObject("SELECT public.admin_totp_confirm_enrolment(?::uuid, ?::uuid, ?)",
                Boolean.class, actor, session, step));
        return Map.of("confirmed", true);
    }

    public Map<String, Object> verify(UUID actor, UUID session, String scope, String code) {
        if (scope == null || !AdminTotpScopes.SCOPES.contains(scope)) throw new Failure(400, "unknown_scope");
        requireAvailable();
        long step = matchOrFail(actor, session, code, true);
        Timestamp expires = call(() -> jdbc.queryForObject("SELECT public.admin_totp_verify(?::uuid, ?::uuid, ?, ?)",
                Timestamp.class, actor, session, scope, step));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("scope", scope);
        out.put("expiresAt", expires == null ? null : expires.toInstant().toString());
        return out;
    }

    public Map<String, Object> revoke(UUID actor, UUID session, UUID target) {
        Boolean revoked = call(() -> jdbc.queryForObject("SELECT public.admin_totp_revoke(?::uuid, ?::uuid, ?::uuid)",
                Boolean.class, actor, session, target));
        return Map.of("revoked", Boolean.TRUE.equals(revoked));
    }

    /** Opens the stored secret, matches the code, and records a failure on any mismatch. */
    private long matchOrFail(UUID actor, UUID session, String code, boolean requireConfirmed) {
        List<Map<String, Object>> rows = call(() -> jdbc.queryForList(
                "SELECT secret_ciphertext, key_id, confirmed, locked_until FROM public.admin_totp_sealed_secret(?::uuid)", actor));
        if (rows.isEmpty()) throw new Failure(409, requireConfirmed ? "not_enrolled" : "no_enrolment_in_progress");
        Map<String, Object> row = rows.get(0);
        boolean confirmed = Boolean.TRUE.equals(row.get("confirmed"));
        if (requireConfirmed && !confirmed) throw new Failure(409, "not_enrolled");
        if (!requireConfirmed && confirmed) throw new Failure(409, "no_enrolment_in_progress");
        if (row.get("locked_until") instanceof Timestamp locked && locked.toInstant().isAfter(clock.instant())) {
            throw new Failure(423, "second_factor_locked");
        }
        byte[] secret;
        try {
            secret = sealer.open(actor, (String) row.get("key_id"), (String) row.get("secret_ciphertext"));
        } catch (IllegalStateException unreadable) {
            // Sealed under another key (rotation) or damaged: the factor cannot be used here.
            throw new Failure(503, "totp_unavailable");
        }
        try {
            OptionalLong step = TotpCodec.matchStep(secret, code, clock.instant().getEpochSecond());
            if (step.isEmpty()) {
                call(() -> jdbc.queryForList("SELECT failed_attempts, locked_until FROM public.admin_totp_record_failure(?::uuid, ?::uuid)",
                        actor, session));
                throw new Failure(401, "invalid_code");
            }
            return step.getAsLong();
        } finally {
            Arrays.fill(secret, (byte) 0);
        }
    }

    private void requireAvailable() {
        if (!sealer.available()) throw new Failure(503, "totp_unavailable");
    }

    private <T> T call(java.util.function.Supplier<T> query) {
        try {
            return query.get();
        } catch (Failure f) {
            throw f;
        } catch (RuntimeException e) {
            throw translate(e);
        }
    }

    /** The SQLSTATE vocabulary of migration 366, mapped to stable codes; anything else is 503. */
    private static Failure translate(RuntimeException e) {
        for (Throwable cause = e; cause != null; cause = cause.getCause()) {
            if (cause instanceof SQLException sql && sql.getSQLState() != null) {
                String message = sql.getMessage() == null ? "" : sql.getMessage();
                switch (sql.getSQLState()) {
                    case "23505": return new Failure(409, "code_already_used");
                    case "55000":
                        if (message.contains("too many")) return new Failure(429, "too_many_attempts");
                        if (message.contains("locked")) return new Failure(423, "second_factor_locked");
                        return new Failure(409, "not_enrolled");
                    case "42501":
                        if (message.contains("reauthentication")) return new Failure(401, "reauthentication_required");
                        if (message.contains("second factor proof")) return new Failure(401, "second_factor_required");
                        return new Failure(403, "forbidden");
                    case "22023":
                        if (message.contains("out of date")) return new Failure(401, "invalid_code");
                        return new Failure(400, "invalid_request");
                    default:
                        break;
                }
            }
        }
        return new Failure(503, "totp_source_unavailable");
    }
}
