package com.moneyverse.api.domain.business;

import com.moneyverse.api.domain.business.service.BusinessService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class BusinessSourceTruthTest {
    final JdbcClient jdbc = mock(JdbcClient.class);
    final BusinessService service = new BusinessService(jdbc);
    @Test void catalogDatabaseErrorIsNotInventedRetailStore() {
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, service::getCatalog);
    }
    @Test void ownershipDatabaseErrorIsNotTrueEmptyInventory() {
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, () -> service.getMyBusinesses("00000000-0000-0000-0000-000000000101"));
    }
    @Test void purchaseDatabaseErrorNeverCreatesReceipt() {
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        assertFalse(service.purchaseBusiness("00000000-0000-0000-0000-000000000101", "00000000-0000-0000-0000-000000000202", "fixture").success());
    }
}
