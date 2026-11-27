package com.moneyverse.api.socket;

import com.corundumstudio.socketio.HandshakeData;
import com.corundumstudio.socketio.SocketIOClient;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.socket.interceptor.SocketSecurityInterceptor;
import io.netty.handler.codec.http.DefaultHttpHeaders;
import io.netty.handler.codec.http.HttpHeaders;
import org.junit.jupiter.api.Test;

import java.net.InetSocketAddress;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * G7 follow-up (2026-11-26): the admin room was checked only on admin:subscribe, so a client
 * whose session was later revoked, or whose admin role was removed, kept receiving control-tower
 * metrics until it disconnected. Members of the room are now re-verified periodically, and a
 * verification that cannot complete evicts rather than keeps (fail closed).
 */
class SocketAdminRoomRecheckTest {
    private static SocketIOClient client(String session) {
        HttpHeaders headers = new DefaultHttpHeaders();
        headers.add("Cookie", "__Host-mv_session=" + session);
        var data = new HandshakeData(headers, Map.of(), new InetSocketAddress("127.0.0.1", 1), new InetSocketAddress("127.0.0.1", 2), "/socket.io/", false);
        SocketIOClient c = mock(SocketIOClient.class);
        when(c.getHandshakeData()).thenReturn(data);
        when(c.getSessionId()).thenReturn(UUID.randomUUID());
        return c;
    }

    @Test void revokedOrFailingAdminSessionsAreEvictedAndVerifiedOnesStay() {
        AdminAuthService admin = mock(AdminAuthService.class);
        when(admin.resolveVerifiedAdminActorByToken("still-admin")).thenReturn(Optional.of(UUID.randomUUID()));
        when(admin.resolveVerifiedAdminActorByToken("revoked")).thenReturn(Optional.empty());
        when(admin.resolveVerifiedAdminActorByToken("db-down")).thenThrow(new IllegalStateException("unavailable"));
        var interceptor = new SocketSecurityInterceptor(admin);
        var kept = client("still-admin");
        var revoked = client("revoked");
        var failing = client("db-down");

        int evicted = interceptor.evictUnverifiedAdmins(List.of(kept, revoked, failing));

        assertEquals(2, evicted);
        verify(kept, never()).leaveRoom(anyString());
        verify(revoked).leaveRoom(SocketSecurityInterceptor.ADMIN_ROOM);
        verify(failing).leaveRoom(SocketSecurityInterceptor.ADMIN_ROOM);
        verify(revoked).sendEvent(eq("admin:error"), any(Object[].class));
    }

    @Test void emptyRoomIsANoOp() {
        AdminAuthService admin = mock(AdminAuthService.class);
        assertEquals(0, new SocketSecurityInterceptor(admin).evictUnverifiedAdmins(List.of()));
        verifyNoInteractions(admin);
    }
}
