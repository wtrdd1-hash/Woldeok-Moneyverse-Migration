package com.moneyverse.api.domain.fx.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
public class FxService {

    private final JdbcTemplate jdbcTemplate;

    @Autowired(required = false)
    public FxService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getReserveStatus() {
        return Map.of(
                "id", "fx-reserve-main",
                "reserveName", "대한민국 외환보유액 통합계정",
                "currency", "USD",
                "totalReservesUsd", 415000000000L,
                "targetAnchorRate", 1350.0,
                "currentRate", 1355.2,
                "isHalted", false,
                "totalInterventionsCount", 12,
                "totalIntervenedUsd", 250000000L,
                "updatedAt", new Date().toInstant().toString()
        );
    }

    public List<Map<String, Object>> getRateHistory(int limit) {
        List<Map<String, Object>> list = new ArrayList<>();
        double baseRate = 1350.0;
        for (int i = 0; i < Math.min(limit, 30); i++) {
            list.add(Map.of(
                    "id", "fx-rate-" + i,
                    "rate", baseRate + (Math.sin(i) * 15.0),
                    "changePct", 0.12,
                    "volumeUsd", 1200000000L,
                    "interventionType", "NONE",
                    "createdAt", new Date(System.currentTimeMillis() - (i * 86400000L)).toInstant().toString()
            ));
        }
        return list;
    }

    public List<Map<String, Object>> listTransactions(int limit) {
        return List.of();
    }

    public List<Map<String, Object>> getSdrAllocations() {
        return List.of(
                Map.of("id", "sdr-usd", "assetName", "미국 달러", "assetType", "CURRENCY", "allocationWeightPct", 43.38, "holdingAmount", 180000000000L, "unit", "USD", "usdValue", 180000000000L),
                Map.of("id", "sdr-eur", "assetName", "유로화", "assetType", "CURRENCY", "allocationWeightPct", 29.31, "holdingAmount", 112000000000L, "unit", "EUR", "usdValue", 121600000000L),
                Map.of("id", "sdr-cny", "assetName", "중국 위안화", "assetType", "CURRENCY", "allocationWeightPct", 12.28, "holdingAmount", 360000000000L, "unit", "CNY", "usdValue", 50900000000L),
                Map.of("id", "sdr-jpy", "assetName", "일본 엔화", "assetType", "CURRENCY", "allocationWeightPct", 7.59, "holdingAmount", 4700000000000L, "unit", "JPY", "usdValue", 31500000000L),
                Map.of("id", "sdr-gbp", "assetName", "영국 파운드", "assetType", "CURRENCY", "allocationWeightPct", 7.44, "holdingAmount", 24000000000L, "unit", "GBP", "usdValue", 30800000000L)
        );
    }

    public List<Map<String, Object>> getSwapAgreements() {
        return List.of(
                Map.of("id", "swap-us-fed", "partnerCountry", "미국 연방준비제도 (FRB)", "maxLimitUsd", 60000000000L, "drawnAmountUsd", 0L, "status", "ACTIVE"),
                Map.of("id", "swap-ecb", "partnerCountry", "유럽중앙은행 (ECB)", "maxLimitUsd", 20000000000L, "drawnAmountUsd", 0L, "status", "ACTIVE")
        );
    }

    public List<Map<String, Object>> listAllForwardContracts(int limit) {
        return List.of();
    }

    public Map<String, Object> getEarlyWarningStatus() {
        return Map.of(
                "level", "NORMAL",
                "volatilityScore", 24.5,
                "forexDrainRisk", "LOW",
                "evaluatedAt", new Date().toInstant().toString()
        );
    }

    public Map<String, Object> getForwardRates() {
        double spotRate = 1355.2;
        double rWld = 0.035;
        double rUsd = 0.0525;

        java.util.function.Function<Integer, Map<String, Object>> calcF = (days) -> {
            double t = (double) days / 360.0;
            double f = spotRate * ((1.0 + rWld * t) / (1.0 + rUsd * t));
            double forwardRate = Math.round(f * 100.0) / 100.0;
            double swapPoint = Math.round((forwardRate - spotRate) * 100.0) / 100.0;
            return Map.of("days", days, "forwardRate", forwardRate, "swapPoint", swapPoint);
        };

        return Map.of(
                "spotRate", spotRate,
                "wldRatePct", 3.5,
                "usdRatePct", 5.25,
                "rates", Map.of(
                        "1M", Map.of("tenor", "1M", "label", "1개월 만기 (30일)", "days", 30, "forwardRate", calcF.apply(30).get("forwardRate"), "swapPoint", calcF.apply(30).get("swapPoint")),
                        "3M", Map.of("tenor", "3M", "label", "3개월 만기 (90일)", "days", 90, "forwardRate", calcF.apply(90).get("forwardRate"), "swapPoint", calcF.apply(90).get("swapPoint")),
                        "6M", Map.of("tenor", "6M", "label", "6개월 만기 (180일)", "days", 180, "forwardRate", calcF.apply(180).get("forwardRate"), "swapPoint", calcF.apply(180).get("swapPoint"))
                )
        );
    }

    public void guardFinancialOperations() {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "FX financial operations are unavailable until ledger-backed settlement is verified.");
    }
}
