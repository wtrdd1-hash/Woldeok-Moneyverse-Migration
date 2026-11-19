package com.moneyverse.api.domain.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import com.moneyverse.api.domain.admin.service.EncryptionService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AdminSourceTruthTest {
    final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    final AdminGovernanceService service = new AdminGovernanceService(jdbc, mock(EncryptionService.class), new ObjectMapper());
    final UUID actor = UUID.randomUUID();
    @Test void userDirectorySqlFailureDoesNotPretendThereAreNoUsers() {
        when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), any(Object[].class)))
                .thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, () -> service.listUsers(actor, 50));
    }
    @Test void ledgerReconciliationSqlFailureNeverManufacturesHealthyBalance() {
        when(jdbc.queryForObject(anyString(), any(org.springframework.jdbc.core.RowMapper.class), any(Object[].class)))
                .thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, () -> service.getLatestReconciliationHealth(actor));
    }
}
