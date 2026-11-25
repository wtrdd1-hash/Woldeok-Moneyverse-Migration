package com.moneyverse.api.domain.identity.service;

import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.Properties;

/**
 * One-time account links over SMTP, ported from the NestJS VerificationEmailSender
 * (same SMTP_* variables, paths and wording). Unconfigured SMTP sends nothing and
 * says so in the log; it never pretends a message went out.
 */
@Component
public class VerificationMailer {
    private static final Logger log = LoggerFactory.getLogger(VerificationMailer.class);

    public enum Purpose { PASSWORD_RESET, EMAIL_CHANGE }

    private final String baseUrl;

    public VerificationMailer(@Value("${moneyverse.app-base-url:${APP_BASE_URL:https://easy-scraping.com}}") String baseUrl) {
        this.baseUrl = baseUrl;
    }

    /** @return true only when the SMTP server accepted the message. */
    public boolean send(String to, String rawToken, Purpose purpose) {
        String host = env("SMTP_HOST"), from = env("SMTP_FROM");
        String user = env("SMTP_USERNAME"), password = System.getenv("SMTP_PASSWORD");
        if (host == null || from == null) {
            log.warn("SMTP is not configured; {} link was not sent", purpose);
            return false;
        }
        boolean secure = !"false".equals(env("SMTP_SECURE"));
        int port = parsePort(env("SMTP_PORT"), secure ? 465 : 587);
        Properties props = new Properties();
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", String.valueOf(port));
        props.put("mail.smtp.ssl.enable", String.valueOf(secure));
        props.put("mail.smtp.starttls.enable", String.valueOf(!secure));
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        boolean authenticated = user != null && password != null;
        props.put("mail.smtp.auth", String.valueOf(authenticated));
        String returnPath = env("SMTP_RETURN_PATH");
        props.put("mail.smtp.from", returnPath != null ? returnPath : from);
        try {
            Session session = Session.getInstance(props);
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from));
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(to, true));
            message.setSubject(subject(purpose), StandardCharsets.UTF_8.name());
            message.setText(body(purpose, link(purpose, rawToken)), StandardCharsets.UTF_8.name());
            if (authenticated) Transport.send(message, user, password);
            else Transport.send(message);
            return true;
        } catch (Exception e) {
            log.warn("SMTP refused the {} link: {}", purpose, e.getClass().getSimpleName());
            return false;
        }
    }

    String link(Purpose purpose, String rawToken) {
        return UriComponentsBuilder.fromUriString(baseUrl)
                .replacePath(purpose == Purpose.PASSWORD_RESET ? "/reset-password" : "/verify-email-change")
                .queryParam("token", rawToken).build().encode().toUriString();
    }

    static String subject(Purpose purpose) {
        return purpose == Purpose.PASSWORD_RESET ? "Reset your Woldeok Moneyverse password"
                : "Verify your new Woldeok Moneyverse login email";
    }

    static String body(Purpose purpose, String link) {
        boolean reset = purpose == Purpose.PASSWORD_RESET;
        return String.join("\r\n",
                reset ? "Woldeok Moneyverse password reset" : "Woldeok Moneyverse login email change",
                "",
                reset ? "Open the link below to choose a new password:" : "Open the link below to verify and activate your new login email:",
                link,
                "",
                reset ? "This link expires in 30 minutes and can be used once. If you did not request a password reset, you can ignore this email."
                      : "This link expires in 30 minutes and can be used once. If you did not request this change, you can ignore this email.");
    }

    private static String env(String name) {
        String v = System.getenv(name);
        return v == null || v.isBlank() ? null : v.trim();
    }

    private static int parsePort(String raw, int fallback) {
        try { int p = raw == null ? fallback : Integer.parseInt(raw); return p >= 1 && p <= 65535 ? p : fallback; }
        catch (NumberFormatException e) { return fallback; }
    }
}
