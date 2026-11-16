package com.moneyverse.api.socket.streamer;

import com.corundumstudio.socketio.SocketIOServer;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class AdminMetricSocketStreamer {

    private static final Logger log = LoggerFactory.getLogger(AdminMetricSocketStreamer.class);

    private final DataSource dataSource;
    private SocketIOServer server;
    private final AtomicInteger activeSocketCount = new AtomicInteger(0);

    public AdminMetricSocketStreamer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void setServer(SocketIOServer server) {
        this.server = server;
    }

    public void updateActiveSockets(int delta) {
        activeSocketCount.addAndGet(delta);
    }

    public int getActiveSocketCount() {
        return Math.max(0, activeSocketCount.get());
    }

    /**
     * 관리자 관제타워(admin:control-tower) 구독 클라이언트 대상 1초 주기 실시간 메트릭 브로드캐스트
     */
    @Scheduled(fixedRate = 1000)
    public void streamMetrics() {
        if (server == null) return;

        try {
            // JVM 메모리 메트릭
            Runtime runtime = Runtime.getRuntime();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            long maxMemory = runtime.maxMemory();

            // HikariCP 풀 메트릭
            int activeConnections = 0;
            int idleConnections = 0;
            int totalConnections = 0;
            int threadsAwaitingConnection = 0;

            if (dataSource instanceof HikariDataSource hikariDs) {
                HikariPoolMXBean poolBean = hikariDs.getHikariPoolMXBean();
                if (poolBean != null) {
                    activeConnections = poolBean.getActiveConnections();
                    idleConnections = poolBean.getIdleConnections();
                    totalConnections = poolBean.getTotalConnections();
                    threadsAwaitingConnection = poolBean.getThreadsAwaitingConnection();
                }
            }

            Map<String, Object> metrics = new HashMap<>();
            metrics.put("timestamp", Instant.now().toString());
            metrics.put("activeSockets", getActiveSocketCount());

            Map<String, Object> jvm = Map.of(
                    "usedMemoryMb", usedMemory / (1024 * 1024),
                    "totalMemoryMb", totalMemory / (1024 * 1024),
                    "maxMemoryMb", maxMemory / (1024 * 1024),
                    "usagePercent", Math.round(((double) usedMemory / maxMemory) * 100.0)
            );
            metrics.put("jvm", jvm);

            Map<String, Object> hikari = Map.of(
                    "active", activeConnections,
                    "idle", idleConnections,
                    "total", totalConnections,
                    "waiting", threadsAwaitingConnection
            );
            metrics.put("hikari", hikari);

            // 관리자 룸으로만 스트리밍하여 일반 트래픽 부하 방지
            server.getRoomOperations("admin:control-tower").sendEvent("admin:metrics", metrics);
        } catch (Exception e) {
            log.debug("[MetricStreamer] Exception collecting metrics: {}", e.getMessage());
        }
    }
}
