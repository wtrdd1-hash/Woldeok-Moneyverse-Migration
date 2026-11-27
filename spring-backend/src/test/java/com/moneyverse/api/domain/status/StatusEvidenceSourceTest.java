package com.moneyverse.api.domain.status;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

/**
 * content_status_sources and content_status_snapshots are not granted to the application role;
 * the public status page reads content_public_status_evidence (365) instead of the tables.
 * Source-level because JdbcClient's fluent chain is not worth a mock; the sandbox run in the
 * worklog checks the function itself as moneyverse_app.
 */
class StatusEvidenceSourceTest {
    @Test void publicStatusReadsTheEvidenceFunction() throws Exception {
        String source = Files.readString(Path.of("src/main/java/com/moneyverse/api/domain/status/StatusTruthService.java"));
        assertTrue(source.contains("FROM public.content_public_status_evidence()"));
        assertFalse(source.contains("FROM public.content_status_sources"));
        assertFalse(source.contains("FROM public.content_status_snapshots"));
    }
}
