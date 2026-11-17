package com.moneyverse.api.domain.treasury.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.SwfLiquidateRequest;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.SwfRebalanceRequest;
import com.moneyverse.api.domain.treasury.repository.TreasuryVaultRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class TreasurySwfFailClosedTest {

    private final TreasuryVaultRepository vaults = mock(TreasuryVaultRepository.class);
    private final JdbcTemplate jdbc = new JdbcTemplate();
    private final TreasuryService service = new TreasuryService(vaults, jdbc, new ObjectMapper());

    @Test
    void snapshotCannotFabricatePortfolioOrUseHardcodedAdminIdentity() {
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,
                assertThrows(ResponseStatusException.class, service::getSwfSnapshot).getStatusCode());
        verifyNoInteractions(vaults);
    }

    @Test
    void governanceCannotClaimSuccessWithoutVerifiedAdminAndDatabaseReceipt() {
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,
                assertThrows(ResponseStatusException.class, () -> service.updateSwfPolicy(java.util.Map.of("is_enabled", true))).getStatusCode());
        verifyNoInteractions(vaults);
    }

    @Test
    void rebalanceCannotReportExecutionWithoutLedgerEvidence() {
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,
                assertThrows(ResponseStatusException.class, () -> service.rebalanceSwf(new SwfRebalanceRequest())).getStatusCode());
        verifyNoInteractions(vaults);
    }

    @Test
    void liquidationCannotReportCreditWithoutLedgerEvidence() {
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,
                assertThrows(ResponseStatusException.class, () -> service.liquidateSwf(new SwfLiquidateRequest())).getStatusCode());
        verifyNoInteractions(vaults);
    }
}
