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
        // A wallet query MAY read canonical ledger rows to determine source health.
        // It must NEVER write or call a transfer function when source evidence is missing.
        // The old no-interactions assertion incorrectly classified legitimate SELECT as mutation.
        for (var invocation : mockingDetails(jdbc).getInvocations()) {
            String method = invocation.getMethod().getName();
            assertFalse(method.equals("update") || method.equals("execute") || method.equals("batchUpdate"),
                    "Never mutate an unverified wallet ledger");
            Object[] args = invocation.getArguments();
            if (args.length > 0 && args[0] instanceof String sql) {
                assertFalse(sql.toLowerCase(java.util.Locale.ROOT).contains("economy_transfer("),
                        "No idempotency-free posting is permitted");
            }
        }
    }

    @Test void privateSpaceGrowthCreditsAndAdvisorCannotInventSuccess() {
        var space = new com.moneyverse.api.domain.space.service.SpaceService(jdbc);
        var progression = new com.moneyverse.api.domain.progression.service.ProgressionService(jdbc);
        var advisor = new com.moneyverse.api.domain.advisor.service.AdvisorService(jdbc);
        var actor = UUID.randomUUID();
        assertThrows(ResponseStatusException.class, () -> space.getMySpaces(actor));
        assertThrows(ResponseStatusException.class, () -> progression.status(actor));
        assertThrows(ResponseStatusException.class, () -> progression.creditStatus(actor));
        assertThrows(ResponseStatusException.class, () -> progression.earlyGameStatus(actor));
        assertThrows(ResponseStatusException.class, () -> advisor.diagnoseUserPortfolio(actor));
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
