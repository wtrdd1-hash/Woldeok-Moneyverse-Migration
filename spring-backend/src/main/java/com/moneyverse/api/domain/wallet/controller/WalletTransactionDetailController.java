package com.moneyverse.api.domain.wallet.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

/**
 * One ledger transaction as the owner sees it (QA 2026-11-25: 404 in Spring). Ported from the
 * NestJS WalletRepository.transactionDetailForUser: one statement, owner pocket legs only, no
 * recipient and no settlement claim. 404 for a transaction that is not the caller's.
 */
@RestController
public class WalletTransactionDetailController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(WalletTransactionDetailController.class);
    private static final Map<String, String> LABELS = Map.ofEntries(
            Map.entry("MINT_TO_USER", "보상 지급"), Map.entry("USER_TO_USER", "사용자 송금"), Map.entry("USER_TO_TREASURY", "운영 수수료"),
            Map.entry("TREASURY_TO_USER", "운영 지급"), Map.entry("USER_TO_SINK", "소비"), Map.entry("BANK_DEPOSIT", "은행 입금"),
            Map.entry("BANK_WITHDRAW", "은행 출금"), Map.entry("BANK_LOAN_ISSUED", "은행 대출"), Map.entry("BANK_LOAN_REPAYMENT", "대출 상환"),
            Map.entry("MARKET_ESCROW", "시장 예치"), Map.entry("MARKET_SETTLEMENT", "시장 정산"), Map.entry("ADMIN_ADJUSTMENT", "관리자 조정"),
            Map.entry("ACCOUNT_MERGE_TRANSFER", "계정 통합"), Map.entry("WORK_REWARD", "작업 보상"), Map.entry("WORK_TASK_REWARD", "작업 보상"),
            Map.entry("BANK_DEPOSIT_INTEREST", "예금 이자"), Map.entry("BUSINESS_PURCHASE", "사업 인수"), Map.entry("BUSINESS_SETTLEMENT", "사업 정산"),
            Map.entry("CONSUMPTION_EVENT", "시즌 소비"), Map.entry("SHOP_PURCHASE", "상점 구매"), Map.entry("SHOP_CATALOG_PURCHASE", "상점 구매"),
            Map.entry("VIRTUAL_COIN_GAME", "동전 게임"), Map.entry("VIRTUAL_DICE_GAME", "주사위 게임"), Map.entry("EARLY_EVENT_REWARD", "초반 사건 보상"),
            Map.entry("SOE_DIVIDEND_HARVEST", "공기업 배당 국고 수취"), Map.entry("TREASURY_USER_DONATION", "국고 자발적 기부"),
            Map.entry("TREASURY_AUTHORIZED_MINT", "조폐국 승인 신규 화폐 국고 발행"), Map.entry("STOCK_LEAGUE_ENTRY", "주식 챔피언십 참가비"),
            Map.entry("MARKETPLACE_APPRAISAL", "마켓 감정서 발급 수수료"), Map.entry("SHOP_MAINTENANCE", "주간 유지비"),
            Map.entry("SINK_BANK_POCKET_CUSTOMIZE", "포켓 커스텀 수수료"), Map.entry("VIRTUAL_STOCK_BUY", "주식 매수"), Map.entry("VIRTUAL_STOCK_SELL", "주식 매도"));
    private static final String SQL = """
            SELECT t.id::text AS transaction_id, t.type AS transaction_type,
                   to_char(t.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS occurred_at,
                   SUM(CASE WHEN a.account_type = 'USER_CASH'::public.account_type
                       THEN CASE p.direction WHEN 'debit'::public.posting_direction THEN p.amount::numeric ELSE -p.amount::numeric END
                       ELSE 0::numeric END)::text AS cash_delta,
                   SUM(CASE WHEN a.account_type = 'USER_BANK'::public.account_type
                       THEN CASE p.direction WHEN 'debit'::public.posting_direction THEN p.amount::numeric ELSE -p.amount::numeric END
                       ELSE 0::numeric END)::text AS bank_delta,
                   SUM(CASE p.direction WHEN 'debit'::public.posting_direction THEN p.amount::numeric ELSE -p.amount::numeric END)::text AS net_delta,
                   COUNT(*) FILTER (WHERE a.currency <> 'WLD') AS invalid_postings
            FROM public.ledger_transactions AS t
            JOIN public.ledger_postings AS p ON p.transaction_id = t.id
            JOIN public.accounts AS a ON a.id = p.account_id
            WHERE a.owner_user_id = ?::uuid AND t.id = ?::uuid
              AND a.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
            GROUP BY t.id, t.type, t.created_at
            """;
    private final JdbcClient jdbc;
    private final MemberApiGuard guard;

    public WalletTransactionDetailController(JdbcClient jdbc, MemberApiGuard guard) {
        this.jdbc = jdbc;
        this.guard = guard;
    }

    public static String label(String type) {
        return LABELS.getOrDefault(type, "경제 활동");
    }

    @GetMapping({"/api/v1/wallet/activity/transactions/{id}", "/api/wallet/activity/transactions/{id}"})
    @Operation(summary = "One of the member's ledger transactions (owner pocket legs only)")
    public ResponseEntity<?> detail(HttpServletRequest request, @PathVariable("id") String id) {
        UUID actor = guard.actor(request);
        UUID tx;
        try { tx = UUID.fromString(id); } catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("code", "TRANSACTION_ID_INVALID")); }
        Map<String, Object> r;
        try {
            r = jdbc.sql(SQL).param(actor).param(tx).query().listOfRows().stream().findFirst().orElse(null);
        } catch (RuntimeException e) {
            Throwable c = NestedExceptionUtils.getMostSpecificCause(e);
            log.warn("[wallet-detail] db call failed: {} {}", c.getClass().getSimpleName(), String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "WALLET_DETAIL_UNAVAILABLE");
        }
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("code", "TRANSACTION_NOT_FOUND"));
        if (r.get("invalid_postings") instanceof Number n && n.longValue() > 0) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "WALLET_DETAIL_UNAVAILABLE");
        }
        Map<String, Object> out = new java.util.LinkedHashMap<>();
        out.put("transactionId", r.get("transaction_id"));
        out.put("typeLabel", label(String.valueOf(r.get("transaction_type"))));
        out.put("occurredAtUtcMicros", r.get("occurred_at"));
        out.put("cashDelta", r.get("cash_delta"));
        out.put("bankDelta", r.get("bank_delta"));
        out.put("netDelta", r.get("net_delta"));
        out.put("currency", "WLD");
        out.put("readStatus", "READ_OK");
        out.put("reconciliationStatus", "NOT_ASSESSED");
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(out);
    }
}
