package com.moneyverse.api.domain.bank;

import com.moneyverse.api.domain.bank.service.PocketService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * bank_saving_pockets is not writable by the application role. Customisation goes through the
 * journaled, idempotent bank_customize_pocket (key locked before replay lookup), and success is
 * reported only from its receipt, never from an UPDATE that may have matched no row.
 */
class PocketCustomizeSourceTest {
    @Test void customisationUsesTheJournaledFunctionWithTheClientKey() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID user = UUID.randomUUID(), pocket = UUID.randomUUID(), key = UUID.randomUUID();
        when(jdbc.queryForList(contains("public.bank_customize_pocket(?::uuid, ?::uuid, ?::uuid, ?, ?)"), eq(key), eq(user), eq(pocket), eq("sky"), isNull()))
                .thenReturn(List.of(Map.of("pocket_id", pocket.toString(), "theme_color", "sky", "icon_code", "piggy-bank", "cost_wld", "100", "remaining_cash", "900")));
        Map<String, Object> result = new PocketService(jdbc).customizePocket(user.toString(), pocket.toString(), "sky", null, key.toString());
        assertEquals("100", result.get("cost_wld"));
        verify(jdbc, never()).update(anyString(), any(Object[].class));
    }

    @Test void aMissingKeyIsRejectedBeforeAnyWrite() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        var e = assertThrows(ResponseStatusException.class, () -> new PocketService(jdbc)
                .customizePocket(UUID.randomUUID().toString(), UUID.randomUUID().toString(), "sky", null, null));
        assertEquals(400, e.getStatusCode().value());
        verifyNoInteractions(jdbc);
    }
}
