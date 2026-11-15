package com.moneyverse.api.domain.admin.service;

import com.moneyverse.api.domain.admin.dto.AdminChannelOtpDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminChannelOtpService {

    private static final Logger log = LoggerFactory.getLogger(AdminChannelOtpService.class);

    private static final long OTP_TTL_MS = 5 * 60 * 1000L; // 5분
    private static final long R2_TTL_MS = 15 * 60 * 1000L; // 15분

    private final SecureRandom secureRandom = new SecureRandom();
    private final RestClient restClient = RestClient.builder().build();

    private final Map<String, OtpSession> otpStore = new ConcurrentHashMap<>();
    private final Map<String, R2ElevationSession> r2Elevations = new ConcurrentHashMap<>();

    @Value("${TELEGRAM_BOT_TOKEN:#{systemEnvironment['TELEGRAM_BOT_TOKEN']}}")
    private String telegramBotToken;

    @Value("${TELEGRAM_ADMIN_CHAT_ID:#{systemEnvironment['TELEGRAM_ADMIN_CHAT_ID']}}")
    private String telegramAdminChatId;

    @Value("${TELEGRAM_ALERTS_CHAT_ID:#{systemEnvironment['TELEGRAM_ALERTS_CHAT_ID']}}")
    private String telegramAlertsChatId;

    @Value("${DISCORD_WEBHOOK_URL:#{systemEnvironment['DISCORD_WEBHOOK_URL']}}")
    private String discordWebhookUrl;

    @Value("${DISCORD_ADMIN_WEBHOOK_URL:#{systemEnvironment['DISCORD_ADMIN_WEBHOOK_URL']}}")
    private String discordAdminWebhookUrl;

    public record OtpSession(String code, long expiresAt, String actionName, long createdAt) {}
    public record R2ElevationSession(long elevatedAt, long expiresAt) {}

    /**
     * 6자리 일회용 OTP 코드를 생성하고 텔레그램 및 디스코드로 발송합니다.
     */
    public OtpRequestResponse requestOtp(String adminUserId, String actionName) {
        String actor = (adminUserId != null && !adminUserId.isBlank()) ? adminUserId.trim() : "admin-operator";
        String action = (actionName != null && !actionName.isBlank()) ? actionName.trim() : "국고/연금 관리자 권한 승인";

        int numericCode = 100000 + secureRandom.nextInt(900000);
        String code = String.valueOf(numericCode);
        long now = System.currentTimeMillis();
        long expiresAt = now + OTP_TTL_MS;

        otpStore.put(actor, new OtpSession(code, expiresAt, action, now));

        String title = "🔐 [월덕 머니버스] 관리자 승인 2FA OTP 코드 발송";
        String timeStr = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                .withZone(ZoneId.of("Asia/Seoul"))
                .format(Instant.ofEpochMilli(now));

        String messageText = String.format(
                "%s\n• 요청 작업: %s\n• 인증 코드: [ %s ]\n• 유효 시간: 5분 (300초 이내 입력)\n• 관리자: %s\n• 발송 시각: %s",
                title, action, code, actor, timeStr
        );

        dispatchToTelegram(messageText);
        dispatchToDiscord(title, messageText);

        log.info("Admin OTP generated for user '{}' action '{}' expiresAt: {}", actor, action, expiresAt);
        return OtpRequestResponse.success(expiresAt);
    }

    /**
     * 입력된 OTP 코드를 상호 대조하여 타이밍 세이프하게 검증합니다.
     * 성공 시 1회용으로 즉시 소모(파기)됩니다.
     */
    public boolean verifyOtp(String adminUserId, String inputCode) {
        String actor = (adminUserId != null && !adminUserId.isBlank()) ? adminUserId.trim() : "admin-operator";
        if (inputCode == null || inputCode.isBlank()) {
            return false;
        }

        OtpSession session = otpStore.get(actor);
        if (session == null) {
            log.warn("No active OTP session found for admin user '{}'", actor);
            return false;
        }

        long now = System.currentTimeMillis();
        if (now > session.expiresAt()) {
            otpStore.remove(actor);
            log.warn("OTP expired for admin user '{}'", actor);
            return false;
        }

        byte[] expectedBytes = session.code().getBytes(StandardCharsets.UTF_8);
        byte[] inputBytes = inputCode.trim().getBytes(StandardCharsets.UTF_8);

        boolean match = MessageDigest.isEqual(expectedBytes, inputBytes);
        if (match) {
            otpStore.remove(actor);
            log.info("Admin OTP successfully verified and consumed for user '{}'", actor);
            return true;
        }

        return false;
    }

    /**
     * R2 민감 거버넌스 페이지 진입을 위한 15분 세션 승격을 수행합니다.
     */
    public OtpElevateResponse elevateR2Session(String adminUserId, String inputCode) {
        String actor = (adminUserId != null && !adminUserId.isBlank()) ? adminUserId.trim() : "admin-operator";
        boolean verified = verifyOtp(actor, inputCode);
        if (!verified) {
            return OtpElevateResponse.failure("OTP 코드가 일치하지 않거나 만료되었습니다.");
        }

        long now = System.currentTimeMillis();
        long expiresAt = now + R2_TTL_MS;
        r2Elevations.put(actor, new R2ElevationSession(now, expiresAt));
        log.info("Admin R2 session elevated for 15 minutes for user '{}'", actor);
        return OtpElevateResponse.success(expiresAt);
    }

    /**
     * 현재 관리자의 R2 세션 승격 상태와 잔여 시간(초)을 확인합니다.
     */
    public OtpStatusResponse getR2ElevationStatus(String adminUserId) {
        String actor = (adminUserId != null && !adminUserId.isBlank()) ? adminUserId.trim() : "admin-operator";
        R2ElevationSession session = r2Elevations.get(actor);
        if (session == null) {
            return new OtpStatusResponse(true, false, 0, 0);
        }

        long now = System.currentTimeMillis();
        if (now > session.expiresAt()) {
            r2Elevations.remove(actor);
            return new OtpStatusResponse(true, false, 0, 0);
        }

        long remainingSeconds = Math.max(0, (session.expiresAt() - now) / 1000L);
        return new OtpStatusResponse(true, true, remainingSeconds, session.expiresAt());
    }

    /**
     * 관리자 R2 세션 승격을 즉시 잠금(Lockout)합니다.
     */
    public OtpRevokeResponse revokeR2Session(String adminUserId) {
        String actor = (adminUserId != null && !adminUserId.isBlank()) ? adminUserId.trim() : "admin-operator";
        r2Elevations.remove(actor);
        log.info("Admin R2 session revoked for user '{}'", actor);
        return OtpRevokeResponse.success();
    }

    /**
     * 텔레그램/디스코드 채널 연동 실시간 테스트 핑을 발송합니다.
     */
    public OtpTestPingResponse sendTestPing(String adminUserId, String channel) {
        String nowStr = DateTimeFormatter.ISO_INSTANT.format(Instant.now());
        String pingMsg = String.format("📡 [월덕 머니버스] 관리자 채널 연동 실시간 핑 테스트 (%s)", nowStr);

        boolean telegramSent = false;
        boolean discordSent = false;

        String target = (channel != null) ? channel.trim().toLowerCase() : "all";

        if ("all".equals(target) || "telegram".equals(target)) {
            telegramSent = dispatchToTelegram(pingMsg);
        }
        if ("all".equals(target) || "discord".equals(target)) {
            discordSent = dispatchToDiscord("📡 관리자 채널 연동 테스트 핑", pingMsg);
        }

        return OtpTestPingResponse.of(telegramSent, discordSent, nowStr);
    }

    private boolean dispatchToTelegram(String message) {
        if (telegramBotToken == null || telegramBotToken.isBlank()) {
            return false;
        }
        String chatId = (telegramAdminChatId != null && !telegramAdminChatId.isBlank())
                ? telegramAdminChatId : telegramAlertsChatId;
        if (chatId == null || chatId.isBlank()) {
            return false;
        }

        try {
            String url = String.format("https://api.telegram.org/bot%s/sendMessage", telegramBotToken);
            Map<String, Object> body = Map.of(
                    "chat_id", chatId,
                    "text", message
            );
            restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception e) {
            log.warn("Telegram dispatch failed: {}", e.getMessage());
            return false;
        }
    }

    private boolean dispatchToDiscord(String title, String description) {
        String webhook = (discordAdminWebhookUrl != null && !discordAdminWebhookUrl.isBlank())
                ? discordAdminWebhookUrl : discordWebhookUrl;
        if (webhook == null || webhook.isBlank()) {
            return false;
        }

        try {
            Map<String, Object> embed = Map.of(
                    "title", title,
                    "description", description,
                    "color", 0x4f46e5 // Indigo
            );
            Map<String, Object> payload = Map.of(
                    "embeds", new Object[]{embed}
            );
            restClient.post()
                    .uri(webhook)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception e) {
            log.warn("Discord dispatch failed: {}", e.getMessage());
            return false;
        }
    }
}
