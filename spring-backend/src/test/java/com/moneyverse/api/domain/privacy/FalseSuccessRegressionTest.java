package com.moneyverse.api.domain.privacy;

import com.moneyverse.api.domain.chat.service.ChatService;
import com.moneyverse.api.domain.support.service.SupportService;
import com.moneyverse.api.domain.wallet.service.WalletService;
import com.moneyverse.api.domain.seo.controller.SeoController;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class FalseSuccessRegressionTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);

    @Test void supportDbReadFailureCannotBeSuccessfulEmptyList() {
        when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), any(Object[].class)))
                .thenThrow(new org.springframework.dao.DataAccessResourceFailureException("isolated-test-db-unavailable"));
        assertThrows(ResponseStatusException.class, () -> new SupportService(jdbc).listThreads(UUID.randomUUID(), null));
    }

    @Test void unreadChatCountCannotBeInventedZero() {
        assertThrows(ResponseStatusException.class, () -> new ChatService(jdbc).totalUnreadCount(UUID.randomUUID()));
    }

    @Test void walletUnavailableCannotInventBalanceOrPostLedgerMutation() {
        WalletService wallet = new WalletService(jdbc);
        assertThrows(ResponseStatusException.class, () -> wallet.getOverview(UUID.randomUUID().toString()));
        assertThrows(ResponseStatusException.class,
                () -> wallet.transfer(UUID.randomUUID().toString(), UUID.randomUUID().toString(), 12L, "unit-test"));
        verifyNoInteractions(jdbc);
    }

    @Test void absentSeoEvidenceCannotGenerateFakeCrawlerSuccess() {
        when(jdbc.queryForList(anyString())).thenReturn(Collections.emptyList());
        var seo = new SeoController(jdbc);
        var overview = seo.getAdminStatus().getBody();
        assertNotNull(overview);
        assertEquals(0, overview.get("totalHits24h"));
        assertTrue(((java.util.List<?>) overview.get("recentLogs")).isEmpty());
        assertEquals("UNKNOWN", seo.getCrawlAudit().getBody().get("status"));
    }
}
