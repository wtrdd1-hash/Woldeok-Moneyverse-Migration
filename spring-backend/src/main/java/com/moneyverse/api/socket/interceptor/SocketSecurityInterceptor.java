package com.moneyverse.api.socket.interceptor;

import com.corundumstudio.socketio.AuthorizationListener;
import com.corundumstudio.socketio.AuthorizationResult;
import com.corundumstudio.socketio.HandshakeData;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

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
