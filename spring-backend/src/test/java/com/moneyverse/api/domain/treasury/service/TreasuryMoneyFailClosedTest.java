package com.moneyverse.api.domain.treasury.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.MintTopupRequest;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.SalaryDisburseRequest;
import com.moneyverse.api.domain.treasury.repository.TreasuryVaultRepository;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TreasuryMoneyFailClosedTest {
    private final TreasuryVaultRepository vaults = mock(TreasuryVaultRepository.class);
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final TreasuryService service = new TreasuryService(vaults, jdbc, new ObjectMapper());

    @Test void mintProcedureFailureCannotCreditVault() {
        when(jdbc.queryForObject(anyString(), eq(String.class), any(), any(), any(), any()))
            .thenThrow(new IllegalStateException("db unavailable"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,
            assertThrows(ResponseStatusException.class, () -> service.mintTopup(new MintTopupRequest())).getStatusCode());
        verifyNoInteractions(vaults);
    }

    @Test void salaryProcedureFailureCannotDebitVault() {
        when(jdbc.queryForObject(anyString(), eq(String.class), any(), any(), any(), any()))
            .thenThrow(new IllegalStateException("db unavailable"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,
            assertThrows(ResponseStatusException.class, () -> service.disburseSalary(new SalaryDisburseRequest())).getStatusCode());
        verifyNoInteractions(vaults);
    }
}
