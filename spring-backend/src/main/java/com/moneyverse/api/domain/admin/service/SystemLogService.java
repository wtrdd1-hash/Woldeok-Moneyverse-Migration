package com.moneyverse.api.domain.admin.service;

import com.moneyverse.api.domain.admin.dto.SystemLogResponse;
import com.moneyverse.api.domain.admin.dto.SystemLogSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SystemLogService {
    private static final Logger log = LoggerFactory.getLogger(SystemLogService.class);
    private static final int MAX_OUTPUT_BYTES = 1_048_576;
    private static final int MAX_LINE_LENGTH = 2048;
    private static final int MAX_FILTER_LENGTH = 120;
    private static final Pattern EMAIL = Pattern.compile("(?i)[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}");
    private static final Pattern IPV4 = Pattern.compile("(?<![\\w.])(?:\\d{1,3}\\.){3}\\d{1,3}(?![\\w.])");
    private static final Pattern BEARER = Pattern.compile("(?i)\\bBearer\\s+[a-z0-9._~+/-]+");
    private static final Pattern AUTH_HEADER = Pattern.compile("(?i)\\b(?:Authorization|Proxy-Authorization|X-Api-Key|X-Auth-Token)\\s*[:=]\\s*[^\\s,;\\\"']+");
    private static final Pattern COOKIE_HEADER = Pattern.compile("(?i)\\b(?:Cookie|Set-Cookie)\\s*:\\s*[^\\r\\n]+");
    private static final Pattern SECRET_FIELDS = Pattern.compile("(?i)(\\b(?:password|passwd|access_token|refresh_token|id_token|api[_-]?key|client_secret|secret|csrf[_-]?token|session[_-]?id|mv_session|token)\\s*[=:]\\s*[\\\"']?)[^\\s&;\\\"',}]+(\\\"?)");
    private static final Pattern URL_PARAMS = Pattern.compile("(?i)([?&][a-z0-9_.-]+=)[^&\\s\\\"']+");
    private static final Pattern JSON_SECRET_FIELDS = Pattern.compile("(?i)([\\\"'](?:password|passwd|access_token|refresh_token|id_token|api[_-]?key|client_secret|secret|csrf[_-]?token|session[_-]?id|mv_session|token)[\\\"']\\s*:\\s*[\\\"'])[^\\\"']+([\\\"'])");
    private static final Pattern UUID = Pattern.compile("(?i)\\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\b");

    public SystemLogResponse getLogs(SystemLogSource source, int lines, String filter) {
        if (lines < 1 || lines > 500 || filter != null && filter.length() > MAX_FILTER_LENGTH) {
            throw new IllegalArgumentException("Invalid log query bounds");
        }
        ReadResult result = fetchRawLogs(source, lines);
        // Redact *before* filtering: otherwise the search feature becomes an oracle for secrets.
        List<String> safeLines = result.lines().stream().map(SystemLogService::redact).collect(Collectors.toList());
        if (filter != null && !filter.isBlank()) {
            String wanted = filter.strip().toLowerCase(java.util.Locale.ROOT);
            safeLines = safeLines.stream()
                    .filter(line -> line.toLowerCase(java.util.Locale.ROOT).contains(wanted))
                    .collect(Collectors.toList());
        }
        return new SystemLogResponse(source.getKey(), source.name(), safeLines, safeLines.size(),
                result.truncated(), Instant.now().toString(),
                result.available() ? (safeLines.isEmpty() ? "EMPTY" : "OK") : "UNAVAILABLE");
    }

    static String redact(String raw) {
        String value = raw.length() > MAX_LINE_LENGTH ? raw.substring(0, MAX_LINE_LENGTH) + " [TRUNCATED]" : raw;
        value = COOKIE_HEADER.matcher(value).replaceAll("Cookie: [REDACTED]");
        value = BEARER.matcher(value).replaceAll("Bearer [REDACTED]");
        value = AUTH_HEADER.matcher(value).replaceAll("Authorization: [REDACTED]");
        value = JSON_SECRET_FIELDS.matcher(value).replaceAll("$1[REDACTED]$2");
        value = SECRET_FIELDS.matcher(value).replaceAll("$1[REDACTED]");
        value = URL_PARAMS.matcher(value).replaceAll("$1[REDACTED]");
        value = EMAIL.matcher(value).replaceAll("[REDACTED-EMAIL]");
        value = IPV4.matcher(value).replaceAll("[REDACTED-IP]");
        value = UUID.matcher(value).replaceAll("[REDACTED-UUID]");
        return value;
    }

    private ReadResult fetchRawLogs(SystemLogSource source, int lines) {
        if (source == null) return ReadResult.unavailable();
        List<String> command;
        if (source.getFilePath() != null) {
            File file = new File(source.getFilePath());
            if (!file.isFile() || !file.canRead()) {
                log.warn("System log source unavailable: {}", source.name());
                return ReadResult.unavailable();
            }
            command = List.of("tail", "-n", String.valueOf(lines), "--", source.getFilePath());
        } else if (source.getServiceUnit() != null) {
            command = List.of("journalctl", "-q", "-u", source.getServiceUnit(), "-n", String.valueOf(lines), "--no-pager", "--output=short-iso");
        } else {
            return ReadResult.unavailable();
        }

        Process process = null;
        try {
            process = new ProcessBuilder(command).redirectErrorStream(true).start();
            Process runningProcess = process;
            // Enforce a wall-clock deadline even while the pipe is being read.
            java.util.concurrent.CompletableFuture.delayedExecutor(4, TimeUnit.SECONDS).execute(() -> {
                if (runningProcess.isAlive()) runningProcess.destroyForcibly();
            });
            byte[] output;
            try (InputStream in = process.getInputStream()) {
                output = in.readNBytes(MAX_OUTPUT_BYTES + 1);
            }
            if (output.length > MAX_OUTPUT_BYTES || !process.waitFor(1, TimeUnit.SECONDS) || process.exitValue() != 0) {
                log.warn("System log read incomplete: {}", source.name());
                return ReadResult.unavailable();
            }
            String body = new String(output, StandardCharsets.UTF_8);
            List<String> rows = body.isEmpty() ? List.of() : Arrays.stream(body.split("\\R", -1))
                    .filter(line -> !line.isEmpty()).limit(lines).collect(Collectors.toCollection(ArrayList::new));
            return new ReadResult(rows, true, rows.size() >= lines);
        } catch (Exception e) {
            log.warn("System log read failed for source {}", source.name());
            return ReadResult.unavailable();
        } finally {
            if (process != null && process.isAlive()) process.destroyForcibly();
        }
    }

    private record ReadResult(List<String> lines, boolean available, boolean truncated) {
        static ReadResult unavailable() { return new ReadResult(List.of(), false, false); }
    }
}
