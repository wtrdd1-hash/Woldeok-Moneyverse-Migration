package com.moneyverse.api.domain.bank.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigInteger;
import java.sql.SQLException;
import java.time.Instant;
import java.util.*;

/**
 * Bank bonds, repayments and read-only standing views through the journaled bank_* DB
 * functions (NestJS BankRepository port). Previews and snapshots are nonbinding reads.
 */
@Service
public class BankLedgerService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(BankLedgerService.class);
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final Set<String> REFUSALS = Set.of("22023", "23505", "55000", "P0001", "23514");
    private final JdbcClient jdbc;

    public BankLedgerService(JdbcClient jdbc) { this.jdbc = jdbc; }

    public Map<String, Object> purchaseBond(UUID actor, String code, long amount, UUID key) {
        return write(() -> first(jdbc.sql("SELECT bond_id::text AS bond_id, bond_name, principal_amount::text AS principal_amount, "
                        + "maturity_amount::text AS maturity_amount, maturity_at::text AS maturity_at, transaction_id::text AS transaction_id "
                        + "FROM public.bank_purchase_bond(?::uuid, ?::text, ?::bigint, ?::uuid)")
                .param(actor).param(code).param(amount).param(key).query().listOfRows()));
    }

    public Map<String, Object> redeemBond(UUID actor, UUID bond, UUID key) {
        return write(() -> first(jdbc.sql("SELECT bond_id::text AS bond_id, maturity_amount::text AS maturity_amount, transaction_id::text AS transaction_id "
                        + "FROM public.bank_redeem_bond(?::uuid, ?::uuid, ?::uuid)")
                .param(actor).param(bond).param(key).query().listOfRows()));
    }

    public Map<String, Object> repay(UUID actor, UUID loan, String amount, UUID key) {
        return write(() -> first(jdbc.sql("SELECT loan_id::text AS loan_id, paid_amount::text AS paid_amount, outstanding_amount::text AS outstanding_amount, "
                        + "transaction_id::text AS transaction_id, replayed FROM public.bank_repay(?::uuid, ?::uuid, ?::uuid, ?::numeric)")
                .param(key).param(actor).param(loan).param(new java.math.BigDecimal(amount)).query().listOfRows()));
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> standing(UUID actor) {
        try {
            String raw = jdbc.sql("SELECT public.bank_get_my_standing(?::uuid)::text").param(actor).query(String.class).single();
            Map<String, Object> m = raw == null ? null : JSON.readValue(raw, Map.class);
            if (m == null) throw new IllegalStateException("no standing");
            return m;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logDb(e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BANK_STANDING_UNAVAILABLE");
        }
    }

    public Map<String, Object> creditFacts(UUID actor) {
        try {
            return first(jdbc.sql("SELECT account_age_days, job_level, repayment_count, overdue_count FROM public.bank_my_credit_facts(?::uuid)")
                    .param(actor).query().listOfRows());
        } catch (RuntimeException e) {
            logDb(e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BANK_CREDIT_FACTS_UNAVAILABLE");
        }
    }

    /** NestJS previewRepayment arithmetic: payable = min(requested, debt), eligible when cash covers it. */
    public static Map<String, Object> preview(String loanId, String cashRaw, String requestedRaw, String debtRaw, boolean unused) {
        BigInteger cash = new BigInteger(cashRaw), requested = new BigInteger(requestedRaw), debt = new BigInteger(debtRaw);
        BigInteger payable = requested.min(debt);
        boolean eligible = cash.compareTo(payable) >= 0;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("loanId", loanId);
        m.put("requestedAmount", requested.toString());
        m.put("payableAmount", payable.toString());
        m.put("cashBefore", cash.toString());
        m.put("cashAfter", eligible ? cash.subtract(payable).toString() : null);
        m.put("debtBefore", debt.toString());
        m.put("debtAfter", debt.subtract(payable).toString());
        m.put("adjustmentAmount", requested.subtract(payable).toString());
        m.put("eligible", eligible);
        m.put("reason", eligible ? "ready" : "insufficient_cash");
        m.put("observedAt", Instant.now().toString());
        m.put("nonbinding", true);
        return m;
    }

    private interface Call<T> { T get(); }

    private static Map<String, Object> first(List<Map<String, Object>> rows) {
        return rows.stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BANK_RECEIPT_MISSING"));
    }

    private static <T> T write(Call<T> call) {
        try { return call.get(); }
        catch (ResponseStatusException e) { throw e; }
        catch (RuntimeException e) {
            logDb(e);
            Throwable c = NestedExceptionUtils.getMostSpecificCause(e);
            if (c instanceof SQLException sql && sql.getSQLState() != null && REFUSALS.contains(sql.getSQLState())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "BANK_REQUEST_REFUSED");
            }
            if (c instanceof SQLException sql && "28000".equals(sql.getSQLState())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "BANK_RECEIPT_NOT_YOURS");
            }
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BANK_SOURCE_UNAVAILABLE");
        }
    }

    private static void logDb(Throwable e) {
        Throwable c = NestedExceptionUtils.getMostSpecificCause(e);
        String state = c instanceof SQLException sql ? sql.getSQLState() : "-";
        log.warn("[bank] db call failed: {} sqlstate={} {}", c.getClass().getSimpleName(), state, String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
    }
}
