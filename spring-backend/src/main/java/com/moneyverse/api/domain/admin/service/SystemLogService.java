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
import java.util.stream.Collectors;

@Service
public class SystemLogService {

    private static final Logger log = LoggerFactory.getLogger(SystemLogService.class);

    public SystemLogResponse getLogs(SystemLogSource source, int lines, String filter) {
        int clampedLines = Math.max(10, Math.min(500, lines));
        List<String> rawLines = fetchRawLogs(source, clampedLines);

        List<String> filteredLines = rawLines;
        if (filter != null && !filter.trim().isEmpty()) {
            String lowerFilter = filter.trim().toLowerCase();
            filteredLines = rawLines.stream()
                    .filter(line -> line.toLowerCase().contains(lowerFilter))
                    .collect(Collectors.toList());
        }

        return new SystemLogResponse(
                source.getKey(),
                source.name(),
                filteredLines,
                filteredLines.size(),
                rawLines.size() >= clampedLines,
                Instant.now().toString(),
                filteredLines.isEmpty() ? "EMPTY" : "OK"
        );
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
            }
        } catch (Exception e) {
            log.error("Failed to read system logs for {}: {}", source, e.getMessage());
            result.add("[ERROR] Failed to read logs: " + e.getMessage());
        }
        return result;
    }
}
