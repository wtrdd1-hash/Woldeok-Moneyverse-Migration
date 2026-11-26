package com.moneyverse.api.domain.seo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.regex.Pattern;

/** One crawler hit, validated before it reaches seo_crawler_logs (security 2026-11-26). */
record CrawlerHit(String botName, String path, int statusCode, int durationMs, String ipAddress, String userAgent) {
    private static final Pattern BOT = Pattern.compile("^[A-Za-z0-9 ._-]{1,64}$");
    private static final Pattern IP = Pattern.compile("^[0-9A-Fa-f:.]{0,45}$");

    static boolean tokenMatches(String expected, String supplied) {
        if (expected == null || expected.length() < 32 || supplied == null) return false;
        return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), supplied.getBytes(StandardCharsets.UTF_8));
    }

    static CrawlerHit from(Map<String, Object> body) {
        if (body == null) throw bad();
        String bot = text(body.get("botName"));
        String path = text(body.get("path"));
        String ip = text(body.get("ipAddress"));
        String ua = text(body.get("userAgent"));
        if (bot == null || !BOT.matcher(bot).matches()) throw bad();
        if (path == null || !path.startsWith("/") || path.length() > 512 || path.chars().anyMatch(Character::isISOControl)) throw bad();
        if (ip != null && !IP.matcher(ip).matches()) throw bad();
        if (ua != null && ua.length() > 512) ua = ua.substring(0, 512);
        if (ua != null && ua.chars().anyMatch(Character::isISOControl)) throw bad();
        return new CrawlerHit(bot, path, number(body.get("statusCode"), 200, 100, 599), number(body.get("durationMs"), 0, 0, 600_000),
                ip == null || ip.isEmpty() ? null : ip, ua);
    }

    private static String text(Object o) { return o instanceof String s ? s : null; }

    private static int number(Object o, int fallback, int min, int max) {
        if (o == null) return fallback;
        if (!(o instanceof Number n) || n.doubleValue() != Math.rint(n.doubleValue())) throw bad();
        long v = n.longValue();
        if (v < min || v > max) throw bad();
        return (int) v;
    }

    private static ResponseStatusException bad() { return new ResponseStatusException(HttpStatus.BAD_REQUEST, "CRAWLER_HIT_INVALID"); }
}
