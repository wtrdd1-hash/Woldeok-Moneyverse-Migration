package com.moneyverse.api.domain.shop;

import com.moneyverse.api.domain.shop.service.ShopService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ShopTruthSecurityRegressionTest {
    @Test
    void catalogDatabaseFailureCannotBeRepresentedAsSuccessfulInventedItems() {
        JdbcClient jdbc = mock(JdbcClient.class);
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("DB unavailable"));
        assertThrows(ResponseStatusException.class, () -> new ShopService(jdbc).getCatalog());
    }
}
