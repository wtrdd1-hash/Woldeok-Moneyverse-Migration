package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.service.AdminChannelOtpService;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** Server-side OTP grant bound to session and user; expires after five minutes. */
@Component
public class SystemLogHistoryOtpGate {
    private final AdminChannelOtpService otp;
    private final ConcurrentHashMap<String, Instant> grants = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Instant> nextRequests = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Integer> attempts = new ConcurrentHashMap<>();

    public SystemLogHistoryOtpGate(AdminChannelOtpService otp) { this.otp = otp; }

    private static String key(UUID actor, UUID session) {
        return "log-history:" + UUID.nameUUIDFromBytes((actor + ":" + session).getBytes(StandardCharsets.UTF_8));
    }

    public void request(UUID actor, UUID session) {
        if (actor == null || session == null) throw new IllegalArgumentException("Session required");
        String key = key(actor, session);
        Instant now = Instant.now();
        nextRequests.compute(key, (k, previous) -> {
            if (previous != null && previous.isAfter(now)) {
                throw new IllegalStateException("OTP request rate-limited");
            }
            return now.plusSeconds(60);
        });
        attempts.remove(key);
        otp.requestOtp(key, "머니버스 중요 보안 로그 조회");
    }

    public boolean verify(UUID actor, UUID session, String code) {
        if (actor == null || session == null || code == null || !code.matches("[0-9]{6}")) return false;
        String key = key(actor, session);
        if (attempts.merge(key, 1, Integer::sum) > 5 || !otp.verifyOtp(key, code)) return false;
        attempts.remove(key);
        grants.put(key, Instant.now().plusSeconds(300));
        return true;
    }

    public boolean allowed(UUID actor, UUID session) {
        if (actor == null || session == null) return false;
        String key = key(actor, session);
        Instant expires = grants.get(key);
        if (expires == null) return false;
        if (Instant.now().isAfter(expires)) {
            grants.remove(key, expires);
            return false;
        }
        return true;
    }
}
