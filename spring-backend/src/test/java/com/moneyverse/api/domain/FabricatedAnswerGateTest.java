package com.moneyverse.api.domain;

import com.moneyverse.api.domain.casino.service.CasinoService;
import com.moneyverse.api.domain.centralbank.service.CentralBankService;
import com.moneyverse.api.domain.macropulse.service.MacroPulseService;
import com.moneyverse.api.domain.board.service.StockCommunityService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

/**
 * QA 2026-11-25: these methods returned constants or reported writes that were
 * never made (기준금리 갱신, 카지노 승패, 종목 토론 글 저장). They must answer 503.
 */
class FabricatedAnswerGateTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);

    private static void unavailable(org.junit.jupiter.api.function.Executable call) {
        ResponseStatusException e = assertThrows(ResponseStatusException.class, call);
        assertEquals(503, e.getStatusCode().value());
    }

    @Test void macroPulseFiguresAreNotInvented() {
        MacroPulseService s = new MacroPulseService(jdbc);
        unavailable(s::getMacroPulse);
        unavailable(s::getHotTimeStatus);
        unavailable(s::getBurnEvents);
    }

    @Test void centralBankPolicyWritesAreNotFaked() {
        CentralBankService s = new CentralBankService(jdbc);
        unavailable(s::getBaseRate);
        unavailable(() -> s.updateBaseRate(325, "r", "a"));
        unavailable(() -> s.updateReserveRequirement(700, "r", "a"));
    }

    @Test void casinoCannotPayOutWithoutTheLedger() {
        CasinoService s = new CasinoService(jdbc);
        unavailable(s::getStats);
        unavailable(() -> s.play("u", null));
    }

    @Test void stockPostCannotClaimToBeSaved() {
        StockCommunityService s = new StockCommunityService(jdbc);
        unavailable(() -> s.createPost("u", Map.of("title", "t")));
        unavailable(() -> s.publicList(null, null));
    }
}
