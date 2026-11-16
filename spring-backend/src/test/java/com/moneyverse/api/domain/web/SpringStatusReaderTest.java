package com.moneyverse.api.domain.web;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SpringStatusReaderTest {
    @Test void usesOnlyAuthoritativeReadOnlyFunction() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        SpringStatusReader reader = new SpringStatusReader(jdbc);
        when(jdbc.query(any(PreparedStatementCreator.class), any(RowMapper.class))).thenReturn(List.of(
                new SpringStatusReader.StatusRow("dbs", "Database", "unknown", null, null)));
        assertEquals("unknown", reader.read().getFirst().state());
        verify(jdbc).query(any(PreparedStatementCreator.class), any(RowMapper.class));
        verifyNoMoreInteractions(jdbc);
    }
    @Test void rejectsBogusHealthyStatusAndMaliciousContent() {
        assertThrows(DataIntegrityViolationException.class, () -> SpringStatusReader.validate(
                new SpringStatusReader.StatusRow("dbs", "Database", "healthy", null, null)));
        assertThrows(DataIntegrityViolationException.class, () -> SpringStatusReader.validate(
                new SpringStatusReader.StatusRow("dbs", "<script>alert(1)</script>", "operational", null, null)));
    }
}
