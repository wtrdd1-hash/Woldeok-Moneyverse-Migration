package com.moneyverse.api.domain.admin.service;

import com.moneyverse.api.domain.admin.dto.SystemLogResponse;
import com.moneyverse.api.domain.admin.dto.SystemLogSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SystemLogService {

    private static final Logger log = LoggerFactory.getLogger(SystemLogService.class);

    private static final Pattern TOKEN_PATTERN =
            Pattern.compile("(?i)(password|token|secret|apiKey|x-internal-token|cookie)\\s*[:=]\\s*([\"']?)([^\\s\"',;]+)(\\2)");
    private static final Pattern BEARER_PATTERN =
            Pattern.compile("(?i)Bearer\\s+([A-Za-z0-9._~+/-]+)");

    public SystemLogResponse getLogs(SystemLogSource source, int lines, String filter) {
        int clampedLines = Math.max(10, Math.min(500, lines));
        List<String> rawLines = fetchRawLogs(source, clampedLines);

        return responseFor(source,clampedLines,filter,rawLines,Instant.now());
    }

    /** Read failures must survive filtering; missing data cannot certify an empty source. */
    static SystemLogResponse responseFor(SystemLogSource source,int clampedLines,String filter,List<String> rawLines,Instant readAt) {
        boolean failed=rawLines.stream().anyMatch(line -> line.startsWith("[WARN] Log file not found")
                || line.startsWith("[WARN] Log fetch timed out") || line.startsWith("[ERROR] Failed to read logs")
                || line.contains("-- No entries --") || line.startsWith("No journal files were found"));
        if(failed)return new SystemLogResponse(source.getKey(),source.name(),List.of(),0,false,readAt.toString(),"UNAVAILABLE",false);
        String effectiveFilter = filter;
        if ((effectiveFilter == null || effectiveFilter.trim().isEmpty()) && source == SystemLogSource.DISCORD_BOT) {
            effectiveFilter = "Discord";
        }
        List<String> filteredLines = rawLines;
        if (effectiveFilter != null && !effectiveFilter.trim().isEmpty()) {
            String lowerFilter = effectiveFilter.trim().toLowerCase();
            filteredLines = rawLines.stream()
                    .filter(line -> line.toLowerCase().contains(lowerFilter))
                    .collect(Collectors.toList());
        }

        // Apply regex masking for sensitive credentials and tokens
        List<String> sanitizedLines = filteredLines.stream()
                .map(SystemLogService::maskSensitiveData)
                .collect(Collectors.toList());

        return new SystemLogResponse(
                source.getKey(),
                source.name(),
                sanitizedLines,
                sanitizedLines.size(),
                rawLines.size() >= clampedLines,
                readAt.toString(),
                sanitizedLines.isEmpty() ? "EMPTY" : "OK",
                true
        );
    }

    public static String maskSensitiveData(String line) {
        if (line == null) return null;
        String masked = BEARER_PATTERN.matcher(line).replaceAll("Bearer [REDACTED]");
        return TOKEN_PATTERN.matcher(masked).replaceAll("$1=[REDACTED]");
    }

    private List<String> fetchRawLogs(SystemLogSource source, int lines) {
        List<String> result = new ArrayList<>();
        try {
            ProcessBuilder pb;
            if (source.getFilePath() != null) {
                File file = new File(source.getFilePath());
                if (!file.exists()) {
                    log.warn("Log file does not exist on host: {}", source.getFilePath());
                    return List.of("[WARN] Log file not found on current host: " + source.getFilePath());
                }
                pb = new ProcessBuilder("tail", "-n", String.valueOf(lines), source.getFilePath());
            } else if (source.getServiceUnit() != null) {
                pb = new ProcessBuilder("journalctl", "-u", source.getServiceUnit(), "-n", String.valueOf(lines), "--no-pager");
            } else {
                return Collections.emptyList();
            }

            pb.redirectErrorStream(true);
            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    result.add(line);
                }
            }

            boolean completed = process.waitFor(4, TimeUnit.SECONDS);
            if (!completed) {
                process.destroyForcibly();
                log.warn("Log fetch process timed out for source: {}", source);
                result.add("[WARN] Log fetch timed out after 4 seconds");
            } else if(process.exitValue()!=0) {
                return List.of("[ERROR] Failed to read logs");
            }
        } catch (Exception e) {
            log.error("Failed to read system logs for {}: {}", source, e.getMessage());
            result.add("[ERROR] Failed to read logs: " + e.getMessage());
        }
        return result;
    }
}
