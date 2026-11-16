package com.moneyverse.api.domain.treasury.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.MintTopupRequest;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.SalaryDisburseRequest;
import com.moneyverse.api.domain.treasury.repository.TreasuryVaultRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class TreasuryMoneyFailClosedTest {

    private static class FailingJdbcTemplate extends JdbcTemplate {
        @Override
        public <T> T queryForObject(String sql, Class<T> requiredType, Object... args) {
            throw new IllegalStateException("db unavailable");
        }
    }

    private final TreasuryVaultRepository vaults = mock(TreasuryVaultRepository.class);
    private final JdbcTemplate jdbc = new FailingJdbcTemplate();
    private final TreasuryService service = new TreasuryService(vaults, jdbc, new ObjectMapper());

    @Test
    void mintProcedureFailureCannotCreditVault() {
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,
                assertThrows(ResponseStatusException.class, () -> service.mintTopup(new MintTopupRequest())).getStatusCode());
        verifyNoInteractions(vaults);
    }

    @Test
    void salaryProcedureFailureCannotDebitVault() {
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,
                assertThrows(ResponseStatusException.class, () -> service.disburseSalary(new SalaryDisburseRequest())).getStatusCode());
        verifyNoInteractions(vaults);
    }
}
