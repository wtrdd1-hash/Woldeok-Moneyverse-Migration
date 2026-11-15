package com.moneyverse.api.domain.macropulse.service;

import com.moneyverse.api.domain.macropulse.dto.MacroPulseDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class MacroPulseService {

    private static final Logger log = LoggerFactory.getLogger(MacroPulseService.class);
    private final JdbcTemplate jdbcTemplate;

    public MacroPulseService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public MacroPulseResponse getMacroPulse() {
        return new MacroPulseResponse(
                true,
                3.8,
                3.25,
                2.1,
                150_000_000_000L,
                4_250_000_000L,
                "EXPANSIONARY_GOLDEN_GROWTH"
        );
    }

    public BurnEventListResponse getBurnEvents() {
        return new BurnEventListResponse(
                true,
                List.of(
                        new BurnEventItem("burn-2026-q3", "3분기 카지노 하우스엣지 수익 100% 통화 소각", "디플레이션 촉진 및 화폐 가치 안정화", 1_500_000_000L, Instant.now().minus(2, ChronoUnit.DAYS).toString()),
                        new BurnEventItem("burn-2026-q2", "2분기 부동산 거래세 및 보유세 특별 소각", "토지 투기 방지 및 통화 환수", 2_750_000_000L, Instant.now().minus(30, ChronoUnit.DAYS).toString())
                )
        );
    }

    public HotTimeStatusResponse getHotTimeStatus() {
        return new HotTimeStatusResponse(
                true,
                true,
                1.5,
                2.0,
                Instant.now().plus(4, ChronoUnit.HOURS).toString()
        );
    }
}
