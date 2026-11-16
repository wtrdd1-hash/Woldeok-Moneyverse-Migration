package com.moneyverse.api.domain;

import com.corundumstudio.socketio.AuthorizationResult;
import com.corundumstudio.socketio.HandshakeData;
import com.moneyverse.api.bot.command.StockSlashCommands;
import com.moneyverse.api.bot.service.DiscordBotService;
import com.moneyverse.api.bot.service.DiscordEconomyBroadcaster;
import com.moneyverse.api.socket.handler.AuctionSocketHandler;
import com.moneyverse.api.socket.handler.ChatSocketHandler;
import com.moneyverse.api.socket.interceptor.SocketSecurityInterceptor;
import com.moneyverse.api.socket.service.SocketIoService;
import com.moneyverse.api.socket.streamer.AdminMetricSocketStreamer;
import io.netty.handler.codec.http.DefaultHttpHeaders;
import io.netty.handler.codec.http.HttpHeaders;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class Phase8SocketAndBotIntegrationTest {

    @Autowired
    private SocketIoService socketIoService;

    @Autowired
    private SocketSecurityInterceptor securityInterceptor;

    @Autowired
    private AuctionSocketHandler auctionHandler;

    @Autowired
    private ChatSocketHandler chatHandler;

    @Autowired
    private AdminMetricSocketStreamer metricStreamer;

    @Autowired
    private StockSlashCommands slashCommands;

    @Autowired
    private DiscordEconomyBroadcaster economyBroadcaster;

    @Autowired
    private DiscordBotService botService;

    @Test
    @DisplayName("Netty-SocketIO 서버 구동 및 생명주기 검증")
    void testSocketIoLifecycle() {
        assertNotNull(socketIoService);
        assertTrue(socketIoService.isRunning(), "Netty-SocketIO 서버가 정상 기동되어 활성 상태여야 합니다.");
        assertNotNull(socketIoService.getServer());
        assertTrue(socketIoService.getServer().getConfiguration().getPort() > 0, "소켓 포트가 정상 할당되어 있어야 합니다.");
    }

    @Test
    @DisplayName("소켓 핸드셰이크 보안 인터셉터 및 2FA 검증 테스트")
    void testSocketSecurityInterceptor() {
        HttpHeaders headers = new DefaultHttpHeaders();
        headers.set("Origin", "https://easy-scraping.com");
        InetSocketAddress address = new InetSocketAddress("127.0.0.1", 12345);

        // 1. 일반 접속 허용 테스트
        HandshakeData normalHandshake = new HandshakeData(headers, new HashMap<>(), address, "https://easy-scraping.com", false);
        AuthorizationResult result = securityInterceptor.getAuthorizationResult(normalHandshake);
        assertTrue(result.isAuthorized(), "일반 클라이언트 핸드셰이크는 통과되어야 합니다.");

        // 2. 내부 시크릿 토큰 인증 통과 테스트
        Map<String, List<String>> tokenParams = Map.of("token", List.of("test-internal-token"));
        HandshakeData tokenHandshake = new HandshakeData(headers, tokenParams, address, "https://easy-scraping.com", false);
        AuthorizationResult tokenResult = securityInterceptor.getAuthorizationResult(tokenHandshake);
        assertTrue(tokenResult.isAuthorized());
        assertTrue(securityInterceptor.verifyAdminRoomAccess(tokenHandshake), "내부 토큰 보유 클라이언트는 관리자 룸 접근이 허용되어야 합니다.");

        // 3. 관리자 2FA 검증 분기 테스트 (2FA 미완료 시 거부)
        Map<String, List<String>> unverifiedAdminParams = Map.of(
                "role", List.of("admin"),
                "twoFactorVerified", List.of("false")
        );
        HandshakeData unverifiedAdminHandshake = new HandshakeData(headers, unverifiedAdminParams, address, "https://easy-scraping.com", false);
        assertFalse(securityInterceptor.verifyAdminRoomAccess(unverifiedAdminHandshake), "2FA가 완료되지 않은 관리자는 관리자 룸 접근이 거절되어야 합니다.");

        // 4. 관리자 2FA 완료 시 승인
        Map<String, List<String>> verifiedAdminParams = Map.of(
                "role", List.of("admin"),
                "twoFactorVerified", List.of("true")
        );
        HandshakeData verifiedAdminHandshake = new HandshakeData(headers, verifiedAdminParams, address, "https://easy-scraping.com", false);
        assertTrue(securityInterceptor.verifyAdminRoomAccess(verifiedAdminHandshake), "2FA가 완료된 관리자는 관리자 룸 접근이 승인되어야 합니다.");
    }

    @Test
    @DisplayName("경매 소켓 브로드캐스트 핸들러 안정성 검증")
    void testAuctionSocketHandler() {
        assertNotNull(auctionHandler);

        assertDoesNotThrow(() -> {
            auctionHandler.broadcastBid(Map.of(
                    "auctionId", "auc-101",
                    "bidAmount", 50000,
                    "bidderName", "월덕투자자"
            ));
            auctionHandler.broadcastAntiSnipingExtended(Map.of(
                    "auctionId", "auc-101",
                    "newEndsAt", "2026-11-16T18:05:00Z"
            ));
            auctionHandler.broadcastProxyBid(Map.of(
                    "auctionId", "auc-101",
                    "autoBidAmount", 60000,
                    "bidderName", "자동입찰봇"
            ));
            auctionHandler.broadcastOutbid(Map.of(
                    "auctionId", "auc-101",
                    "previousBidderName", "이전입찰자"
            ));
        });
    }

    @Test
    @DisplayName("관리자 관제타워 1초 주기 실시간 메트릭 스트리밍 검증")
    void testAdminMetricStreamer() {
        assertNotNull(metricStreamer);
        metricStreamer.updateActiveSockets(5);
        assertEquals(5, metricStreamer.getActiveSocketCount());

        assertDoesNotThrow(() -> {
            metricStreamer.streamMetrics();
        }, "메트릭 수집 및 스트리밍 실행 중 예외가 발생하지 않아야 합니다.");

        metricStreamer.updateActiveSockets(-5);
        assertEquals(0, metricStreamer.getActiveSocketCount());
    }

    @Test
    @DisplayName("Discord4J 봇 서비스 및 경제 브로드캐스터 대기 모드 검증")
    void testDiscordBotAndBroadcaster() {
        assertNotNull(botService);
        assertNotNull(slashCommands);
        assertNotNull(economyBroadcaster);

        // 토큰 미설정 상태에서 에러 없이 대기 모드 유지 검증
        assertFalse(botService.isRunning(), "토큰이 비어있을 때는 봇이 대기 모드를 유지해야 합니다.");

        // 브로드캐스터 메서드 무결성 실행 검증
        assertDoesNotThrow(() -> {
            economyBroadcaster.sendLog("Test system message");
            economyBroadcaster.sendAdminAlert("Test emergency alert");
            economyBroadcaster.broadcastMarketClosingBriefing();
        });
    }
}
