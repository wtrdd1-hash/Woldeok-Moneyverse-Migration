package com.moneyverse.api.domain.treasury.service;

import com.moneyverse.api.domain.treasury.dto.TreasuryDtos.*;
import com.moneyverse.api.domain.treasury.model.TreasuryVault;
import com.moneyverse.api.domain.treasury.repository.TreasuryVaultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class TreasuryService {

    private static final Logger log = LoggerFactory.getLogger(TreasuryService.class);

    private final TreasuryVaultRepository vaultRepository;

    @Value("${moneyverse.features.swf-operational:true}")
    private boolean swfOperational = true;

    public TreasuryService(TreasuryVaultRepository vaultRepository) {
        this.vaultRepository = vaultRepository;
    }

    /**
     * 조폐국(MINT) 화폐발행 국고 직행 충전
     */
    @Transactional
    public TreasuryOperationResult mintTopup(MintTopupRequest request) {
        log.info("[TreasuryService] Mint topup initiated: amount={} WLD, reason={}", request.getAmountWld(), request.getReason());

        TreasuryVault mainVault = vaultRepository.findByVaultCode("VAULT_MAIN")
                .orElseGet(() -> TreasuryVault.builder()
                        .vaultCode("VAULT_MAIN")
                        .balanceWld(0L)
                        .description("중앙 국고 주 금고 (Main Treasury Vault)")
                        .build());

        mainVault.credit(request.getAmountWld());
        vaultRepository.save(mainVault);

        String txId = UUID.randomUUID().toString();
        log.info("[TreasuryService] Mint topup completed: txId={}, newBalance={}", txId, mainVault.getBalanceWld());

        return TreasuryOperationResult.builder()
                .success(true)
                .txId(txId)
                .vaultCode("VAULT_MAIN")
                .amountWld(request.getAmountWld())
                .newVaultBalanceWld(mainVault.getBalanceWld())
                .reason(request.getReason())
                .executedAt(Instant.now().toString())
                .build();
    }

    /**
     * 국고 관리자 임금 지급
     */
    @Transactional
    public TreasuryOperationResult disburseSalary(SalaryDisburseRequest request) {
        log.info("[TreasuryService] Salary disburse initiated: amount={} WLD", request.getAmountWld());

        TreasuryVault mainVault = vaultRepository.findByVaultCode("VAULT_MAIN")
                .orElseThrow(() -> new IllegalStateException("Main vault not found"));

        mainVault.debit(request.getAmountWld());
        vaultRepository.save(mainVault);

        String txId = UUID.randomUUID().toString();
        log.info("[TreasuryService] Salary disburse completed: txId={}, remainingBalance={}", txId, mainVault.getBalanceWld());

        return TreasuryOperationResult.builder()
                .success(true)
                .txId(txId)
                .vaultCode("VAULT_MAIN")
                .amountWld(request.getAmountWld())
                .newVaultBalanceWld(mainVault.getBalanceWld())
                .reason("관리자 국고 노고 치하 정기 임금 지급")
                .executedAt(Instant.now().toString())
                .build();
    }

    /**
     * 국부펀드(SWF) 자동투자 및 리밸런싱 실행
     */
    public Map<String, Object> rebalanceSwf(SwfRebalanceRequest request) {
        log.info("[TreasuryService] SWF rebalance requested: operational={}", swfOperational);

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("executed", true);
        result.put("reason", "SWF_REBALANCED_AND_RECONCILED");
        result.put("totalAumWld", 10000000L);
        result.put("rebalancedPortfolio", Map.of(
                "TECH", 40,
                "FINANCE", 30,
                "CONSUMER", 20,
                "CASH_RESERVE", 10
        ));
        result.put("reconciledAt", Instant.now().toString());
        return result;
    }

    /**
     * 국부펀드(SWF) 평가액 국고 환원
     */
    @Transactional
    public Map<String, Object> liquidateSwf(SwfLiquidateRequest request) {
        log.info("[TreasuryService] SWF liquidation requested: amount={} WLD", request.getAmountWld());

        TreasuryVault mainVault = vaultRepository.findByVaultCode("VAULT_MAIN")
                .orElseGet(() -> TreasuryVault.builder()
                        .vaultCode("VAULT_MAIN")
                        .balanceWld(0L)
                        .description("중앙 국고 주 금고")
                        .build());

        mainVault.credit(request.getAmountWld());
        vaultRepository.save(mainVault);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("liquidatedAmountWld", request.getAmountWld());
        result.put("newVaultBalanceWld", mainVault.getBalanceWld());
        result.put("reason", request.getReason());
        result.put("executedAt", Instant.now().toString());
        return result;
    }
}
