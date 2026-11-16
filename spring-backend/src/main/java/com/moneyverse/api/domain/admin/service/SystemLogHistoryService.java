package com.moneyverse.api.domain.admin.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.admin.dto.SystemLogSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/** Bounded read-only adapter: a fixed executable and archive root, never a user-supplied path. */
@Service
public class SystemLogHistoryService {
    private static final Logger log = LoggerFactory.getLogger(SystemLogHistoryService.class);
    private static final int MAX_RESPONSE_BYTES = 1_600_000;
    private final ObjectMapper mapper;
    private final String reader;
    private final String root;

    public SystemLogHistoryService(ObjectMapper mapper) {
        this(mapper,
                System.getenv().getOrDefault("MONEYVERSE_LOG_ARCHIVE_READER",
                        "/usr/local/libexec/moneyverse-log-lifecycle.py"),
                System.getenv().getOrDefault("MONEYVERSE_LOG_ARCHIVE_ROOT",
                        "/var/lib/moneyverse/log-archive"));
    }

    SystemLogHistoryService(ObjectMapper mapper, String reader, String root) {
        this.mapper = mapper;
        this.reader = reader;
        this.root = root;
    }

    public JsonNode read(SystemLogSource source, String classification,
                         Instant start, Instant end, String filter, int limit, String cursor) {
        if (source == null || !List.of("routine", "important", "all").contains(classification)
                || start == null || end == null || end.isBefore(start)
                || end.isAfter(Instant.now().plusSeconds(300))
                || Duration.between(start, end).compareTo(Duration.ofDays(30)) > 0
                || limit < 1 || limit > 500 || filter != null && filter.length() > 120
                || cursor != null && cursor.length() > 1024) {
            throw new IllegalArgumentException("Invalid history query");
        }
        if (filter != null && filter.chars().anyMatch(c -> c < 32)) {
            throw new IllegalArgumentException("Invalid history filter");
        }
        List<String> command = new ArrayList<>(List.of(
                "python3", reader, "--root", root, "query", "--source", source.name(),
                "--classification", classification,
                "--from", start.toString(), "--to", end.toString(),
                "--limit", String.valueOf(limit), "--filter", filter == null ? "" : filter));
        if (cursor != null && !cursor.isBlank()) {
            command.add("--cursor");
            command.add(cursor);
        }
        Process process = null;
        try {
            process = new ProcessBuilder(command).redirectErrorStream(true).start();
            Process active = process;
            java.util.concurrent.CompletableFuture.delayedExecutor(5, TimeUnit.SECONDS).execute(() -> {
                if (active.isAlive()) active.destroyForcibly();
            });
            byte[] response;
            try (InputStream stream = process.getInputStream()) {
                response = stream.readNBytes(MAX_RESPONSE_BYTES + 1);
            }
            if (response.length > MAX_RESPONSE_BYTES || !process.waitFor(1, TimeUnit.SECONDS)
                    || process.exitValue() != 0) {
                throw new IllegalStateException("Archive reader failed/limited");
            }
            JsonNode json = mapper.readTree(response);
            if (json == null || !json.isObject() || !json.path("entries").isArray()
                    || !json.path("source").asText().equals(source.name())
                    || !List.of("OK", "EMPTY").contains(json.path("status").asText())) {
                throw new IllegalStateException("Archive reader contract invalid");
            }
            return json;
        } catch (Exception e) {
            log.warn("Admin log archive temporarily unavailable: {}", source.name());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Log archive unavailable");
        } finally {
            if (process != null && process.isAlive()) process.destroyForcibly();
        }
    }
}
