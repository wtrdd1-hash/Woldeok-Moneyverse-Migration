package com.moneyverse.api.socket.interceptor;

import com.corundumstudio.socketio.AuthorizationListener;
import com.corundumstudio.socketio.AuthorizationResult;
import com.corundumstudio.socketio.HandshakeData;
import com.corundumstudio.socketio.SocketIOClient;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;

/**
 * Socket.IO handshake and admin-room authorization.
 *
 * Security 2026-11-26: the admin control-tower room was granted to any client sending
 * ?role=admin&twoFactorVerified=true, or a shared internal token whose production value equals
 * a literal committed to this public repository. Neither is an identity. Connections stay open
 * for public market data; the admin room requires a verified administrator session (database
 * session + current DB admin role) read from the browser's session cookie on the handshake.
 */
@Component
public class SocketSecurityInterceptor implements AuthorizationListener {

    private static final Logger log = LoggerFactory.getLogger(SocketSecurityInterceptor.class);
    public static final String ADMIN_ROOM = "admin:control-tower";
    private final AdminAuthService adminAuthService;

    public SocketSecurityInterceptor(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @Override
    public AuthorizationResult getAuthorizationResult(HandshakeData data) {
        // Public, read-only market feeds need no identity; privileged rooms check per subscribe.
        return AuthorizationResult.SUCCESSFUL_AUTHORIZATION;
    }

    /** Admin control-tower room: verified admin session cookie only; query parameters are ignored. */
    public boolean verifyAdminRoomAccess(HandshakeData data) {
        String token = sessionToken(data == null ? null : data.getHttpHeaders().get("Cookie"));
        if (token == null) return false;
        boolean ok = adminAuthService.resolveVerifiedAdminActorByToken(token).isPresent();
        if (!ok) log.warn("[SocketAuth] admin room refused (no verified admin session)");
        return ok;
    }

    /**
     * Re-verifies every member of the admin room and removes those whose session or admin role
     * is no longer valid. Checking only on admin:subscribe left a revoked administrator receiving
     * control-tower metrics until disconnect. A verification that throws (database unavailable)
     * evicts: keeping an unverifiable client is the failure that matters, and a real
     * administrator re-subscribes in one click.
     */
    public int evictUnverifiedAdmins(Collection<SocketIOClient> clients) {
        int evicted = 0;
        for (SocketIOClient client : clients) {
            boolean ok;
            try {
                ok = verifyAdminRoomAccess(client.getHandshakeData());
            } catch (RuntimeException failure) {
                ok = false;
            }
            if (ok) continue;
            client.leaveRoom(ADMIN_ROOM);
            client.sendEvent("admin:error", Map.of("status", "UNAUTHORIZED", "message", "관리자 권한 또는 2FA 인증이 필요합니다."));
            evicted++;
        }
        if (evicted > 0) log.warn("[SocketAuth] evicted {} admin-room client(s) without a verified admin session", evicted);
        return evicted;
    }

    /** The session token from a Cookie header: __Host-mv_session first, then the legacy mv_session. */
    static String sessionToken(String cookieHeader) {
        if (cookieHeader == null || cookieHeader.isBlank()) return null;
        String host = null, legacy = null;
        for (String part : cookieHeader.split(";")) {
            int eq = part.indexOf('=');
            if (eq <= 0) continue;
            String name = part.substring(0, eq).trim();
            String value = part.substring(eq + 1).trim();
            if (value.isEmpty() || value.length() > 512) continue;
            if ("__Host-mv_session".equals(name) && host == null) host = value;
            else if ("mv_session".equals(name) && legacy == null) legacy = value;
        }
        return host != null ? host : legacy;
    }
}
