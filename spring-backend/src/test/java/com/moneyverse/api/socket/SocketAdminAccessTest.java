package com.moneyverse.api.socket;

import com.corundumstudio.socketio.HandshakeData;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.socket.handler.ChatSocketHandler;
import com.moneyverse.api.socket.interceptor.SocketSecurityInterceptor;
import io.netty.handler.codec.http.DefaultHttpHeaders;
import io.netty.handler.codec.http.HttpHeaders;
import org.junit.jupiter.api.Test;

import java.net.InetSocketAddress;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Security 2026-11-26 (PR #3454 recheck on the production build): admin:subscribe granted the
 * admin control-tower room to anyone sending ?role=admin&twoFactorVerified=true, or the
 * internal token whose production value equals a literal committed to this public repository.
 * Admin room access now requires a verified admin session from the handshake cookie.
 */
class SocketAdminAccessTest {
    private static HandshakeData handshake(String cookie, Map<String, List<String>> params) {
        HttpHeaders headers = new DefaultHttpHeaders();
        if (cookie != null) headers.add("Cookie", cookie);
        return new HandshakeData(headers, params, new InetSocketAddress("127.0.0.1", 1), new InetSocketAddress("127.0.0.1", 2), "/socket.io/", false);
    }

    @Test void forgedQueryParametersNeverGrantTheAdminRoom() {
        AdminAuthService admin = mock(AdminAuthService.class);
        var interceptor = new SocketSecurityInterceptor(admin);
        var forged = handshake(null, Map.of("role", List.of("admin"), "twoFactorVerified", List.of("true"), "token", List.of("anything")));
        assertFalse(interceptor.verifyAdminRoomAccess(forged));
        verify(admin, never()).resolveVerifiedAdminActorByToken(anyString());
    }

    @Test void onlyAVerifiedAdminSessionCookieGrantsTheAdminRoom() {
        AdminAuthService admin = mock(AdminAuthService.class);
        when(admin.resolveVerifiedAdminActorByToken("good-session")).thenReturn(Optional.of(UUID.randomUUID()));
        when(admin.resolveVerifiedAdminActorByToken("member-session")).thenReturn(Optional.empty());
        var interceptor = new SocketSecurityInterceptor(admin);
        assertTrue(interceptor.verifyAdminRoomAccess(handshake("theme=dark; __Host-mv_session=good-session", Map.of())));
        assertFalse(interceptor.verifyAdminRoomAccess(handshake("__Host-mv_session=member-session", Map.of())));
        assertFalse(interceptor.verifyAdminRoomAccess(handshake("other=1", Map.of())));
    }

    @Test void chatJoinAcceptsOnlyPublicRooms() {
        assertTrue(ChatSocketHandler.isPublicRoom("lobby"));
        assertTrue(ChatSocketHandler.isPublicRoom("stock:WDM"));
        assertTrue(ChatSocketHandler.isPublicRoom("market"));
        assertFalse(ChatSocketHandler.isPublicRoom("admin:control-tower"));
        assertFalse(ChatSocketHandler.isPublicRoom("user:5f7b8b44-e4aa-40b8-b93a-800ec0151d20"));
        assertFalse(ChatSocketHandler.isPublicRoom(""));
        assertFalse(ChatSocketHandler.isPublicRoom(null));
    }
}
