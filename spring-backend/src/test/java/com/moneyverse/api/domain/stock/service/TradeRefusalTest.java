package com.moneyverse.api.domain.stock.service;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

class TradeRefusalTest {
    @Test void ruleRefusalIsConflictNotOutage() {
        var refused = new DataIntegrityViolationException("x", new SQLException("insufficient holdings", "P0001"));
        assertEquals(HttpStatus.CONFLICT, StockService.tradeRefusal(refused).getStatusCode());
        var broken = new DataIntegrityViolationException("x", new SQLException("connection lost", "08006"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, StockService.tradeRefusal(broken).getStatusCode());
    }
}
