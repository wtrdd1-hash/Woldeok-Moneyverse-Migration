package com.moneyverse.api.domain.web;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/** Public source-truth status read: never infer success or fabricate observations. */
@Service
public class SpringStatusReader {
    private static final String SQL = """
            SELECT source_key, display_name, state, detail, observed_at
              FROM public.content_public_status()
            """;
    private static final Pattern SOURCE_KEY = Pattern.compile("[a-z][a-z0-9_-]{2,63}");
    private static final Set<String> STATES = Set.of("operational", "degraded", "outage", "maintenance", "unknown");
    private final JdbcTemplate jdbc;

    public record StatusRow(String sourceKey, String displayName, String state,
                            String detail, String observedAt) {}

    public SpringStatusReader(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<StatusRow> read() {
        List<StatusRow> result = jdbc.query(connection -> {
            PreparedStatement statement = connection.prepareStatement(SQL);
            statement.setQueryTimeout(3);
            statement.setMaxRows(201);
            return statement;
        }, (rs, index) -> {
            Timestamp at = rs.getTimestamp("observed_at");
            return new StatusRow(rs.getString("source_key"), rs.getString("display_name"),
                    rs.getString("state"), rs.getString("detail"),
                    at == null ? null : at.toInstant().toString());
        });
        if (result == null || result.size() > 200) {
            throw new DataIntegrityViolationException("Unexpected status source count");
        }
        result.forEach(SpringStatusReader::validate);
        return List.copyOf(result);
    }

    static void validate(StatusRow row) {
        if (row == null || row.sourceKey() == null
                || !SOURCE_KEY.matcher(row.sourceKey()).matches()
                || row.displayName() == null || row.displayName().isBlank()
                || row.displayName().length() > 80 || row.displayName().contains("<")
                || row.displayName().contains(">") || row.state() == null
                || !STATES.contains(row.state())
                || (row.detail() != null && row.detail().length() > 280)
                || (row.observedAt() != null && invalidDate(row.observedAt()))
                || (!"unknown".equals(row.state()) && row.observedAt() == null)) {
            throw new DataIntegrityViolationException("Invalid public status snapshot");
        }
    }

    private static boolean invalidDate(String raw) {
        try { Instant.parse(raw); return false; }
        catch (RuntimeException exception) { return true; }
    }
}
