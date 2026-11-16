package com.moneyverse.api.socket.config;

import com.corundumstudio.socketio.SocketConfig;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.Transport;
import com.moneyverse.api.socket.interceptor.SocketSecurityInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.ServerSocket;

@Configuration
public class SocketIoConfig {

    private static final Logger log = LoggerFactory.getLogger(SocketIoConfig.class);

    @Value("${moneyverse.socket.host:0.0.0.0}")
    private String host;

    @Value("${moneyverse.socket.port:9092}")
    private int port;

    @Value("${moneyverse.socket.boss-threads:1}")
    private int bossThreads;

    @Value("${moneyverse.socket.worker-threads:4}")
    private int workerThreads;

    @Value("${moneyverse.socket.ping-interval:25000}")
    private int pingInterval;

    @Value("${moneyverse.socket.ping-timeout:60000}")
    private int pingTimeout;

    @Value("${moneyverse.socket.max-frame-payload-length:1048576}")
    private int maxFramePayloadLength;

    private final SocketSecurityInterceptor securityInterceptor;

    public SocketIoConfig(SocketSecurityInterceptor securityInterceptor) {
        this.securityInterceptor = securityInterceptor;
    }

    @Bean(destroyMethod = "stop")
    public SocketIOServer socketIOServer() {
        int targetPort = port;
        if (targetPort <= 0) {
            try (ServerSocket socket = new ServerSocket(0)) {
                targetPort = socket.getLocalPort();
            } catch (Exception e) {
                targetPort = 19092;
            }
        }

        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname(host);
        config.setPort(targetPort);
        config.setBossThreads(bossThreads);
        config.setWorkerThreads(workerThreads);
        config.setPingInterval(pingInterval);
        config.setPingTimeout(pingTimeout);
        config.setMaxFramePayloadLength(maxFramePayloadLength);
        config.setOrigin(null); // 모든 Origin 허용 (Nginx 역방향 프록시 및 CORS 호환)
        config.setTransports(Transport.WEBSOCKET, Transport.POLLING);
        config.setAuthorizationListener(securityInterceptor);

        SocketConfig socketConfig = new SocketConfig();
        socketConfig.setReuseAddress(true);
        socketConfig.setTcpNoDelay(true);
        socketConfig.setSoLinger(0);
        config.setSocketConfig(socketConfig);

        log.info("[SocketIO] Configured Netty-SocketIO server on {}:{} with pingInterval={}ms, pingTimeout={}ms",
                host, targetPort, pingInterval, pingTimeout);

        return new SocketIOServer(config);
    }
}
