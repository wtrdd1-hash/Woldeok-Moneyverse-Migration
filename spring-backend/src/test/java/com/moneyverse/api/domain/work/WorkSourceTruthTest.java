package com.moneyverse.api.domain.work;

import com.moneyverse.api.domain.work.service.WorkService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class WorkSourceTruthTest {
    final JdbcClient jdbc = mock(JdbcClient.class);
    final WorkService service = new WorkService(jdbc);

    @Test void dashboardDatabaseErrorDoesNotReportFabricatedQuotas() {
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, () -> service.getDashboard("00000000-0000-0000-0000-000000000101"));
    }

    @Test void tasksDatabaseErrorDoesNotReportInventedJobs() {
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, () -> service.getTaskBoard("00000000-0000-0000-0000-000000000101"));
    }

    @Test void assignmentsDatabaseErrorDoesNotReportEmptyAsReal() {
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, () -> service.getMyAssignments("00000000-0000-0000-0000-000000000101"));
    }

    @Test void assignErrorCannotManufactureSuccessReceipt() {
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        var result = service.assignTask("00000000-0000-0000-0000-000000000101", "00000000-0000-0000-0000-000000000202");
        assertFalse(result.success());
        assertNull(result.assignmentId());
    }
}
