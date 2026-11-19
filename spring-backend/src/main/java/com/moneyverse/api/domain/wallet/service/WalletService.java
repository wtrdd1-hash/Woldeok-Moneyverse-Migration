package com.moneyverse.api.domain.wallet.service;

import com.moneyverse.api.domain.wallet.dto.WalletDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);
    private final JdbcTemplate jdbcTemplate;

    public WalletService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public WalletOverview getOverview(String userId) {
        // The old implementation returned a fabricated 100000 WLD fallback or directly
        // updated a noncanonical wallet table without an immutable finance posting receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Canonical wallet ledger not verified");
    }

    @Transactional
    public Map<String, Object> transfer(String fromUserId, String toUserId, Long amountWld, String memo) {
        // The old implementation returned a fabricated 100000 WLD fallback or directly
        // updated a noncanonical wallet table without an immutable finance posting receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Canonical wallet ledger not verified");
    }
}
