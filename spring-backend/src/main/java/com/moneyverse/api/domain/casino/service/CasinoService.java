package com.moneyverse.api.domain.casino.service;

import com.moneyverse.api.domain.casino.dto.CasinoDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.*;

@Service
public class CasinoService {

    private static final Logger log = LoggerFactory.getLogger(CasinoService.class);
    private final JdbcTemplate jdbcTemplate;
    private final SecureRandom random = new SecureRandom();

    public CasinoService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public CasinoStats getStats() {
        return new CasinoStats("25000000", "23750000", 15420L, "95.00%", "5000000");
    }

    @Transactional
    public Map<String, Object> play(String userId, CasinoPlayRequest req) {
        long bet = req.getBetAmountWld();
        boolean win = random.nextDouble() < 0.48; // 48% 승률
        double multiplier = win ? 2.0 : 0.0;
        long payout = (long) (bet * multiplier);

        String txId = UUID.randomUUID().toString();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("txId", txId);
        res.put("userId", userId);
        res.put("betAmountWld", bet);
        res.put("payoutWld", payout);
        res.put("multiplier", multiplier);
        res.put("win", win);
        res.put("message", win ? "축하합니다! 베팅 승리로 " + payout + " WLD를 획득하셨습니다!" : "아쉽게도 낙첨되었습니다.");
        return res;
    }
}
