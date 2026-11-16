package com.moneyverse.api.socket.interceptor;

import com.corundumstudio.socketio.AuthorizationListener;
import com.corundumstudio.socketio.AuthorizationResult;
import com.corundumstudio.socketio.HandshakeData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Netty-SocketIO 핸드셰이크 단계 보안 및 2FA 인증 인터셉터
 */
@Component
public class SocketSecurityInterceptor implements AuthorizationListener {

    private static final Logger log = LoggerFactory.getLogger(SocketSecurityInterceptor.class);

    @Value("${moneyverse.security.internal-token:}")
    private String internalToken;

    @Override
    public AuthorizationResult getAuthorizationResult(HandshakeData data) {
        String clientAddress = data.getAddress() != null ? data.getAddress().toString() : "unknown";
        String origin = data.getHttpHeaders().get("Origin");

        // 내부 시스템 토큰 검증
        List<String> tokenParam = data.getUrlParams().get("token");
        if (tokenParam != null && !tokenParam.isEmpty()) {
            String token = tokenParam.get(0);
            if (internalToken != null && !internalToken.isBlank() && token.equals(internalToken)) {
                log.info("[SocketAuth] Internal system / Admin handshake authorized from {}", clientAddress);
                return AuthorizationResult.SUCCESSFUL_AUTHORIZATION;
            }
        }

        // 일반 접속 클라이언트는 웹소켓 연결 허용
        log.debug("[SocketAuth] Client handshake accepted: address={}, origin={}", clientAddress, origin);
        return AuthorizationResult.SUCCESSFUL_AUTHORIZATION;
    }

    /**
     * 특정 룸(예: admin:control-tower) 입장 시 2FA 완료 여부 검증
     */
    public boolean verifyAdminRoomAccess(HandshakeData data) {
        List<String> tokenParam = data.getUrlParams().get("token");
        if (tokenParam != null && !tokenParam.isEmpty() && tokenParam.get(0).equals(internalToken)) {
            return true;
        }

        List<String> roleParam = data.getUrlParams().get("role");
        List<String> twoFactorParam = data.getUrlParams().get("twoFactorVerified");

        boolean isAdmin = roleParam != null && !roleParam.isEmpty() && "admin".equalsIgnoreCase(roleParam.get(0));
        boolean is2FaVerified = twoFactorParam != null && !twoFactorParam.isEmpty() && "true".equalsIgnoreCase(twoFactorParam.get(0));

        return isAdmin && is2FaVerified;
    }
}
