package com.moneyverse.api.domain.wallet.controller;

import com.moneyverse.api.domain.wallet.service.WalletService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** A transfer's replay-stable key comes from the authenticated caller, never random per attempt. */
class WalletTransferIdempotencyRegressionTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final WalletService service = new WalletService(jdbc);

    @Test void unkeyedTransferRejectsBeforeAnyDatabaseCall() {
        var from = UUID.randomUUID();
        var to = UUID.randomUUID();
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.transfer(from.toString(), to.toString(), 11L, "test"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
        verifyNoInteractions(jdbc);
    }

    @Test void explicitIdempotencyKeyIsPassedUnchangedToCanonicalPostingFunction() {
        UUID key = UUID.randomUUID(), from = UUID.randomUUID(), to = UUID.randomUUID(), posted = UUID.randomUUID();
        when(jdbc.queryForObject(contains("economy_transfer"), eq(UUID.class), eq(key), eq(from), eq(to), eq(BigDecimal.valueOf(11)))).thenReturn(posted);
        var result=service.transferWithIdempotencyKey(from.toString(),to.toString(),11L,"test",key);
        assertEquals(Boolean.TRUE,result.get("success"));
        assertEquals(posted.toString(),result.get("txId"));
        verify(jdbc,times(1)).queryForObject(contains("economy_transfer"),eq(UUID.class),eq(key),eq(from),eq(to),eq(BigDecimal.valueOf(11)));
    }

    @Test void missingReceiptIsNeverReportedAsSuccess() {
        UUID key=UUID.randomUUID(), from=UUID.randomUUID(),to=UUID.randomUUID();
        ResponseStatusException error=assertThrows(ResponseStatusException.class,
                ()->service.transferWithIdempotencyKey(from.toString(),to.toString(),11L,"test",key));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,error.getStatusCode());
    }
    @Test void canonical38DigitTransferReachesDatabaseAsExactDecimalAndReturnsString() {
        UUID key=UUID.randomUUID(),from=UUID.randomUUID(),to=UUID.randomUUID(),posted=UUID.randomUUID();
        String amount="99999999999999999999999999999999999999";
        when(jdbc.queryForObject(contains("economy_transfer"),eq(UUID.class),eq(key),eq(from),eq(to),eq(new BigDecimal(amount)))).thenReturn(posted);
        var result=service.transferCanonicalWithIdempotencyKey(from.toString(),to.toString(),amount,"",key);
        assertEquals(amount,result.get("amount"));
        assertEquals(posted.toString(),result.get("txId"));
    }
    @Test void canonicalRejectionMustNotBecomeAnUncertainRetry() {
        when(jdbc.queryForObject(contains("economy_transfer"),eq(UUID.class),any(),any(),any(),any()))
                .thenThrow(new org.springframework.dao.DataIntegrityViolationException("ci_rejected",
                        new java.sql.SQLException("ci_no_funds","22023")));
        var error=assertThrows(ResponseStatusException.class,()->service.transferCanonicalWithIdempotencyKey(
                UUID.randomUUID().toString(),UUID.randomUUID().toString(),"11","",UUID.randomUUID()));
        assertEquals(HttpStatus.CONFLICT,error.getStatusCode());
    }

}
