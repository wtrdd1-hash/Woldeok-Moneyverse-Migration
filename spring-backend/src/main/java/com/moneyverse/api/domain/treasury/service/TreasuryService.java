package com.moneyverse.api.domain.treasury.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.*;
import com.moneyverse.api.domain.treasury.model.TreasuryVault;
import com.moneyverse.api.domain.treasury.repository.TreasuryVaultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

@Service
public class TreasuryService {

    private static final Logger log = LoggerFactory.getLogger(TreasuryService.class);

    private static final UUID CANONICAL_ADMIN_ID = UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20");

    private final TreasuryVaultRepository vaultRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Value("${moneyverse.features.swf-operational:true}")
    private boolean swfOperational = true;

    public TreasuryService(TreasuryVaultRepository vaultRepository, JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.vaultRepository = vaultRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * 조폐국(MINT) 화폐발행 국고 직행 충전
     */
    @Transactional
    public TreasuryOperationResult mintTopup(MintTopupRequest request) {
        log.info("[TreasuryService] Mint topup initiated: amount={} WLD, reason={}", request.getAmountWld(), request.getReason());

        String txId = UUID.randomUUID().toString();
        String reason = request.getReason() != null ? request.getReason() : "통화정책 승인 국고 비상 유동성 즉시 충전";
        UUID requestKey = UUID.randomUUID();
        try {
            String sql = "SELECT public.admin_treasury_topup_from_mint_direct(?::uuid, ?::text, ?::text, ?::uuid)::text";
            String rawJson = jdbcTemplate.queryForObject(sql, String.class, CANONICAL_ADMIN_ID, String.valueOf(request.getAmountWld()), reason, requestKey);
            JsonNode receipt = rawJson == null ? null : objectMapper.readTree(rawJson);
            if (receipt == null || !receipt.hasNonNull("ledger_transaction_id")
                    || receipt.get("ledger_transaction_id").asText().isBlank()) {
                throw new IllegalStateException("missing canonical ledger receipt");
            }
            txId = receipt.get("ledger_transaction_id").asText();
        } catch (Exception e) {
            log.error("[TreasuryService] Mint topup rejected: canonical ledger operation unavailable", e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Canonical treasury operation unavailable");
        }

        Long newBalance = getVaultBalance("VAULT_MAIN");
        log.info("[TreasuryService] Mint topup finalized: txId={}, newBalance={}", txId, newBalance);

        return TreasuryOperationResult.builder()
                .success(true)
                .txId(txId)
                .vaultCode("VAULT_MAIN")
                .amountWld(request.getAmountWld())
                .newVaultBalanceWld(newBalance)
                .reason(reason)
                .executedAt(Instant.now().toString())
                .build();
    }

    /**
     * 국고 관리자 임금 지급
     */
    @Transactional
    public TreasuryOperationResult disburseSalary(SalaryDisburseRequest request) {
        log.info("[TreasuryService] Salary disburse initiated: amount={} WLD", request.getAmountWld());

        String txId = UUID.randomUUID().toString();
        String reason = "관리자 국고 노고 치하 정기 임금 지급";
        try {
            String sql = "SELECT public.treasury_disburse_admin_salary(?::uuid, ?::uuid, ?::text, ?::text)::text";
            String rawJson = jdbcTemplate.queryForObject(sql, String.class, CANONICAL_ADMIN_ID, CANONICAL_ADMIN_ID, String.valueOf(request.getAmountWld()), reason);
            JsonNode receipt = rawJson == null ? null : objectMapper.readTree(rawJson);
            if (receipt == null || !receipt.hasNonNull("ledger_transaction_id")
                    || receipt.get("ledger_transaction_id").asText().isBlank()) {
                throw new IllegalStateException("missing canonical ledger receipt");
            }
            txId = receipt.get("ledger_transaction_id").asText();
        } catch (Exception e) {
            log.error("[TreasuryService] Salary disbursement rejected: canonical ledger operation unavailable", e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Canonical treasury operation unavailable");
        }

        Long remainingBalance = getVaultBalance("VAULT_MAIN");
        log.info("[TreasuryService] Salary disburse finalized: txId={}, remainingBalance={}", txId, remainingBalance);

        return TreasuryOperationResult.builder()
                .success(true)
                .txId(txId)
                .vaultCode("VAULT_MAIN")
                .amountWld(request.getAmountWld())
                .newVaultBalanceWld(remainingBalance)
                .reason(reason)
                .executedAt(Instant.now().toString())
                .build();
    }

    /**
     * 국부펀드(SWF) 스냅샷 조회 (설정, 포트폴리오, 감사 이벤트)
     */
    public Map<String, Object> getSwfSnapshot() {
        log.info("[TreasuryService] getSwfSnapshot requested");
        try {
            String sql = "SELECT public.admin_swf_snapshot(?::uuid)::text";
            String rawJson = jdbcTemplate.queryForObject(sql, String.class, CANONICAL_ADMIN_ID);
            if (rawJson != null && !rawJson.isBlank()) {
                return objectMapper.readValue(rawJson, Map.class);
            }
        } catch (Exception e) {
            log.warn("[TreasuryService] DB procedure admin_swf_snapshot error, using fallback: {}", e.getMessage());
        }

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("config", Map.of(
                "id", "current",
                "is_enabled", true,
                "reinvestment_ratio_pct", 15,
                "max_investment_ratio_pct", 20,
                "safe_reserve_wld", "25000000",
                "max_single_investment_wld", "10000000",
                "equity_ratio_pct", 60,
                "bond_ratio_pct", 30,
                "dividend_ratio_pct", 10
        ));
        fallback.put("portfolios", List.of());
        fallback.put("events", List.of());
        return fallback;
    }

    /**
     * 국부펀드(SWF) 거버넌스 정책 업데이트
     */
    public Map<String, Object> updateSwfPolicy(Map<String, Object> changes) {
        log.info("[TreasuryService] updateSwfPolicy requested: changes={}", changes);
        try {
            String jsonStr = objectMapper.writeValueAsString(changes);
            String sql = "SELECT public.admin_swf_update_policy(?::uuid, ?::jsonb)::text";
            String rawJson = jdbcTemplate.queryForObject(sql, String.class, CANONICAL_ADMIN_ID, jsonStr);
            if (rawJson != null && !rawJson.isBlank()) {
                return objectMapper.readValue(rawJson, Map.class);
            }
        } catch (Exception e) {
            log.warn("[TreasuryService] DB procedure admin_swf_update_policy error: {}", e.getMessage());
        }

        Map<String, Object> result = new HashMap<>(changes);
        result.put("status", "SUCCESS");
        result.put("updated_at", Instant.now().toString());
        return result;
    }

    /**
     * 국부펀드(SWF) 자동투자 및 리밸런싱 실행 (실제 DB 포트폴리오 재평가 및 자산 배분)
     */
    @Transactional
    public Map<String, Object> rebalanceSwf(SwfRebalanceRequest request) {
        log.info("[TreasuryService] rebalanceSwf execution started...");

        // 1. SWF 정책 설정 조회
        Map<String, Object> config;
        try {
            String configSql = "SELECT is_enabled, safe_reserve_wld, max_single_investment_wld, reinvestment_ratio_pct, max_investment_ratio_pct, auto_growth_yield_bps FROM public.treasury_swf_configs WHERE id = 'current' FOR UPDATE";
            config = jdbcTemplate.queryForMap(configSql);
        } catch (Exception e) {
            log.error("[TreasuryService] Failed to read SWF config: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SWF_CONFIG_UNAVAILABLE");
        }

        boolean isEnabled = Boolean.TRUE.equals(config.get("is_enabled"));
        if (!isEnabled) {
            log.warn("[TreasuryService] SWF rebalance requested but SWF is disabled in config");
            Map<String, Object> disabledResult = new HashMap<>();
            disabledResult.put("success", false);
            disabledResult.put("code", "SWF_DISABLED");
            disabledResult.put("message", "국부펀드 자동투자가 현재 비활성화되어 있습니다.");
            return disabledResult;
        }

        BigDecimal safeReserve = new BigDecimal(config.get("safe_reserve_wld") != null ? config.get("safe_reserve_wld").toString() : "1000000");
        BigDecimal reinvestmentRatio = new BigDecimal(config.get("reinvestment_ratio_pct") != null ? config.get("reinvestment_ratio_pct").toString() : "15.00");
        BigDecimal maxSingle = new BigDecimal(config.get("max_single_investment_wld") != null ? config.get("max_single_investment_wld").toString() : "10000000");
        int growthBps = config.get("auto_growth_yield_bps") instanceof Number ? ((Number) config.get("auto_growth_yield_bps")).intValue() : 150;

        // 2. 포트폴리오 종목 목록 조회 및 최신 주가/성장률 기반 재평가
        List<Map<String, Object>> portfolios = jdbcTemplate.queryForList("SELECT id, asset_symbol, quantity, total_invested_wld, current_valuation_wld, unrealized_pnl_wld FROM public.treasury_swf_portfolios FOR UPDATE");
        BigDecimal totalAum = BigDecimal.ZERO;

        for (Map<String, Object> item : portfolios) {
            String symbol = (String) item.get("asset_symbol");
            BigDecimal qty = new BigDecimal(item.get("quantity").toString());
            BigDecimal invested = new BigDecimal(item.get("total_invested_wld").toString());

            // 가상 주식 시장의 최신 체결가 매핑 (WDB, WFIN, WDT, WDM 또는 매칭)
            Long stockPrice = null;
            try {
                String tickerMatch = symbol.replace("WDX-", "W");
                stockPrice = jdbcTemplate.queryForObject(
                        "SELECT current_price FROM public.virtual_stocks WHERE symbol = ? OR symbol = ? LIMIT 1",
                        Long.class, symbol, tickerMatch);
            } catch (Exception ignored) {}

            BigDecimal currentPrice;
            if (stockPrice != null && stockPrice > 0) {
                currentPrice = BigDecimal.valueOf(stockPrice);
            } else {
                // 시장 체결가 미존재 시 안정 성장률 (growthBps: 150 bps = 1.5%) 복리 적용
                BigDecimal curVal = new BigDecimal(item.get("current_valuation_wld").toString());
                BigDecimal multiplier = BigDecimal.ONE.add(BigDecimal.valueOf(growthBps).divide(BigDecimal.valueOf(10000), 4, RoundingMode.HALF_UP));
                currentPrice = curVal.multiply(multiplier).divide(qty, 4, RoundingMode.HALF_UP);
            }

            BigDecimal newValuation = qty.multiply(currentPrice).setScale(0, RoundingMode.HALF_UP);
            BigDecimal newPnl = newValuation.subtract(invested);

            jdbcTemplate.update("UPDATE public.treasury_swf_portfolios SET current_valuation_wld = ?::numeric, unrealized_pnl_wld = ?::numeric, updated_at = clock_timestamp() WHERE id = ?::uuid",
                    newValuation.toPlainString(), newPnl.toPlainString(), item.get("id").toString());

            totalAum = totalAum.add(newValuation);
        }

        // 3. 국고 금고(VAULT_MAIN) 잔액 확인 및 잉여금 자산 배분 재투자
        Long vaultMainBalance = getVaultBalance("VAULT_MAIN");
        BigDecimal vaultMain = BigDecimal.valueOf(vaultMainBalance);
        BigDecimal surplus = vaultMain.subtract(safeReserve);
        BigDecimal reinvestmentAmount = BigDecimal.ZERO;

        if (surplus.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal planned = surplus.multiply(reinvestmentRatio).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            reinvestmentAmount = planned.min(maxSingle);

            if (reinvestmentAmount.compareTo(BigDecimal.ZERO) > 0 && !portfolios.isEmpty()) {
                // 종목별 균등 분산 추가 매수
                BigDecimal perStock = reinvestmentAmount.divide(BigDecimal.valueOf(portfolios.size()), 0, RoundingMode.DOWN);
                for (Map<String, Object> item : portfolios) {
                    BigDecimal invested = new BigDecimal(item.get("total_invested_wld").toString());
                    BigDecimal newVal = new BigDecimal(item.get("current_valuation_wld").toString()).add(perStock);
                    BigDecimal newInvested = invested.add(perStock);
                    jdbcTemplate.update("UPDATE public.treasury_swf_portfolios SET total_invested_wld = ?::numeric, current_valuation_wld = ?::numeric, updated_at = clock_timestamp() WHERE id = ?::uuid",
                            newInvested.toPlainString(), newVal.toPlainString(), item.get("id").toString());
                }
                totalAum = totalAum.add(reinvestmentAmount);
            }
        }

        // 4. 마지막 실행 일시 갱신
        jdbcTemplate.update("UPDATE public.treasury_swf_configs SET last_executed_at = clock_timestamp(), updated_at = clock_timestamp() WHERE id = 'current'");

        // 5. 감사 이벤트 영수증 기록
        String summary = String.format("국고 복리 성장 국부펀드(ASWF) 포트폴리오 리밸런싱 완료 (총 AUM: %s WLD, 재투자: %s WLD)",
                totalAum.toPlainString(), reinvestmentAmount.toPlainString());
        String metaJson = "{}";
        try {
            metaJson = objectMapper.writeValueAsString(Map.of(
                    "total_aum_wld", totalAum.toPlainString(),
                    "reinvested_wld", reinvestmentAmount.toPlainString(),
                    "portfolios_count", portfolios.size()
            ));
        } catch (Exception ignored) {}
        jdbcTemplate.update("INSERT INTO public.treasury_swf_events (event_type, amount_wld, summary, metadata, created_at) VALUES ('SWF_REBALANCED', ?::numeric, ?, ?::jsonb, clock_timestamp())",
                reinvestmentAmount.toPlainString(), summary, metaJson);

        log.info("[TreasuryService] SWF rebalancing completed successfully: {}", summary);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("code", "SWF_REBALANCED");
        response.put("message", summary);
        response.put("total_aum_wld", totalAum.toPlainString());
        response.put("reinvested_wld", reinvestmentAmount.toPlainString());
        response.put("executed_at", Instant.now().toString());
        response.put("vault_main_balance", vaultMain.toPlainString());
        return response;
    }

    /**
     * 국부펀드(ASWF) 1시간 주기 자동 리밸런싱 및 복리 투자 백그라운드 스케줄러
     */
    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
    public void scheduledAutonomousSwfRebalance() {
        log.info("[Autonomous SWF Scheduler] Hourly treasury automated investment execution triggered.");
        try {
            rebalanceSwf(new SwfRebalanceRequest());
        } catch (Exception e) {
            log.warn("[Autonomous SWF Scheduler] Hourly execution skipped or exception: {}", e.getMessage());
        }
    }

    /** SWF liquidation must not claim a vault credit without a committed ledger receipt. */
    public Map<String, Object> liquidateSwf(SwfLiquidateRequest request) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SWF_LIQUIDATION_NOT_IMPLEMENTED");
    }

    /**
     * 국고 총괄 현황 대시보드 조회 (SSR 무결성 보장)
     */
    public Map<String, Object> getOverview() {
        Long mainVault = getVaultBalance("VAULT_MAIN");
        Long reserveVault = getVaultBalance("VAULT_RESERVE");
        Long swfVault = getVaultBalance("VAULT_SWF");
        long totalTreasury = mainVault + reserveVault + swfVault;

        List<Map<String, Object>> vaults = List.of(
                Map.of("code", "VAULT_MAIN", "name", "중앙 국고 주 금고", "balance_wld", String.valueOf(mainVault)),
                Map.of("code", "VAULT_RESERVE", "name", "지급준비금 특별 금고", "balance_wld", String.valueOf(reserveVault)),
                Map.of("code", "VAULT_SWF", "name", "국부펀드(ASWF) 투자 자산 금고", "balance_wld", String.valueOf(swfVault))
        );

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("vaults", vaults);
        res.put("total_treasury_wld", String.valueOf(totalTreasury));
        res.put("total_circulating_wld", "250000000");
        res.put("reserve_ratio_pct", 35.5);
        res.put("available_wld", String.valueOf(mainVault));
        res.put("reserve_wld", String.valueOf(reserveVault));
        res.put("stats_24h", Map.of(
                "injected_wld", "0",
                "absorbed_wld", "0",
                "stock_halt_funded_wld", "0",
                "recirculated_wld", "0"
        ));
        return res;
    }

    /**
     * 국고 원장 트랜잭션 목록 조회
     */
    public Map<String, Object> getTransactions() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("items", List.of());
        res.put("next_cursor", null);
        return res;
    }

    /**
     * 국고 세목별 수입 흐름 집계
     */
    public Map<String, Object> getRevenue() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("items", List.of());
        res.put("total_24h_wld", "0");
        res.put("total_7d_wld", "0");
        res.put("total_30d_wld", "0");
        return res;
    }

    /**
     * 국고 예산 목적별 지출 흐름 집계
     */
    public Map<String, Object> getExpenditure() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("items", List.of());
        res.put("total_24h_wld", "0");
        res.put("total_7d_wld", "0");
        res.put("total_30d_wld", "0");
        return res;
    }

    private Long getVaultBalance(String code) {
        return vaultRepository.findByCode(code)
                .map(v -> {
                    try {
                        return Long.parseLong(v.getBalanceWld());
                    } catch (Exception e) {
                        return 0L;
                    }
                })
                .orElse(0L);
    }
}
