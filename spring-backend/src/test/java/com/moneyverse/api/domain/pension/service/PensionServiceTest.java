package com.moneyverse.api.domain.pension.service;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pension reads go through actor-bound or aggregate functions (308, 360). The former overview
 * substituted a hard-coded vault balance and "certified" a payout rate that no source holds, and
 * answered zeros when the database failed.
 */
class PensionServiceTest {
    @Test void overviewReadsTheAggregateFunctionAndCertifiesNothingItCannotSource() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        new PensionService(jdbc).getOverview();
        verify(jdbc).queryForObject(contains("public.pension_public_overview()"), any(RowMapper.class));
    }

    @Test void anUnreadableOverviewIsUnavailableNotZero() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForObject(anyString(), any(RowMapper.class))).thenThrow(new DataAccessResourceFailureException("down"));
        var e = assertThrows(ResponseStatusException.class, () -> new PensionService(jdbc).getOverview());
        assertEquals(503, e.getStatusCode().value());
    }

    @Test void memberAccountReadIsActorBound() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        String actor = UUID.randomUUID().toString();
        new PensionService(jdbc).readExistingAccount(actor);
        verify(jdbc).queryForObject(contains("public.pension_owner_account(?::uuid)"), any(RowMapper.class), eq(actor));
    }
}
