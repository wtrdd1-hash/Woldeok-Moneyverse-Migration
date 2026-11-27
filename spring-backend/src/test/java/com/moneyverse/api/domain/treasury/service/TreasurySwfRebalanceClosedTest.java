package com.moneyverse.api.domain.treasury.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.SwfRebalanceRequest;
import com.moneyverse.api.domain.treasury.repository.TreasuryVaultRepository;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * The SWF rebalance rewrote treasury portfolio valuations (with an assumed 1.5% growth when no price
 * existed) and added "reinvested" amounts without a ledger posting, hourly by scheduler. Like the
 * liquidation, it now refuses until an investment is a journaled transaction, and nothing runs it
 * on a timer.
 */
class TreasurySwfRebalanceClosedTest {
    @Test void rebalanceTouchesNoTable() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        var service = new TreasuryService(mock(TreasuryVaultRepository.class), jdbc, new ObjectMapper());
        var e = assertThrows(ResponseStatusException.class, () -> service.rebalanceSwf(new SwfRebalanceRequest()));
        assertEquals(503, e.getStatusCode().value());
        verifyNoInteractions(jdbc);
    }

    @Test void noSchedulerRunsTheRebalance() {
        boolean scheduled = Arrays.stream(TreasuryService.class.getDeclaredMethods())
                .anyMatch(m -> m.isAnnotationPresent(Scheduled.class) && m.getName().toLowerCase().contains("swf"));
        assertFalse(scheduled);
    }
}
