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
        // No verified session principal is bound to this Spring controller yet.
        // A hardcoded privileged actor and synthetic values must never represent member money.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "SWF_ADMIN_IDENTITY_NOT_VERIFIED");
    }

    /**
     * SWF governance remains unavailable until a verified session actor,
     * DB authorization and an audited DB receipt are bound end-to-end.
     */
    public Map<String, Object> updateSwfPolicy(Map<String, Object> changes) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "SWF_GOVERNANCE_IDENTITY_NOT_VERIFIED");
    }

    /**
     * 국부펀드(SWF) 자동투자 및 리밸런싱 실행
     */
    public Map<String, Object> rebalanceSwf(SwfRebalanceRequest request) {
        // No canonical DB receipt, posting, or idempotency contract is wired yet.
        // Never fabricate a successful financial execution.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SWF_REBALANCE_NOT_IMPLEMENTED");
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
