package com.moneyverse.api.domain.pension.service;

import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Certified pension ledger: every value comes from a SECURITY DEFINER DB
 * function. Nothing here computes a balance, writes a table, or turns a
 * failure into an empty or successful answer.
 */
@Service
public class PensionLedgerService {
    /** The DB functions refuse more than 50 rows (22023). */
    public static final int HISTORY_LIMIT = 50;
    private static final String ISO = "to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"')";
    /** Invalid parameter, insufficient privilege, raised rule: the ledger refused the request. */
    private static final Set<String> REFUSALS = Set.of("22023", "42501", "P0001", "23514");

    private final JdbcClient jdbc;

    public PensionLedgerService(JdbcClient jdbc) { this.jdbc = jdbc; }

    public Map<String, Object> position(UUID actor) {
        try {
            return jdbc.sql("SELECT funded_principal_wld, cumulative_funded_contribution_wld, escrow_balance_wld, certified_receipt_count "
                            + "FROM public.treasury_core_pension_position(?::uuid)")
                    .param(actor).query().listOfRows().stream().findFirst()
                    .orElseThrow(() -> unavailable("PENSION_POSITION_MISSING"));
        } catch (RuntimeException e) {
            throw translate(e);
        }
    }

    public List<Map<String, Object>> contributions(UUID actor) {
        try {
            return jdbc.sql("SELECT id::text AS id, amount_wld::text AS amount_wld, coalesce(note, '') AS note, " + ISO + " AS created_at "
                            + "FROM public.pension_owner_contributions(?::uuid, ?)")
                    .param(actor).param(HISTORY_LIMIT).query().listOfRows();
        } catch (RuntimeException e) {
            throw translate(e);
        }
    }

    public List<Map<String, Object>> payouts(UUID actor) {
        try {
            return jdbc.sql("SELECT id::text AS id, payout_amount_wld::text AS payout_amount_wld, "
                            + "snapshot_accumulated_wld::text AS snapshot_accumulated_wld, " + ISO + " AS created_at "
                            + "FROM public.pension_owner_payout_logs(?::uuid, ?)")
                    .param(actor).param(HISTORY_LIMIT).query().listOfRows();
        } catch (RuntimeException e) {
            throw translate(e);
        }
    }

    /** NPS_FUND or NPS_WITHDRAW through the Treasury Core; the receipt is returned exactly as the DB wrote it. */
    public Map<String, Object> post(UUID actor, UUID key, String command, String principalWld) {
        Map<String, Object> receipt;
        try {
            receipt = jdbc.sql("SELECT ledger_transaction_id::text AS ledger_transaction_id, principal_wld, user_disbursement_wld, "
                            + "welfare_fee_wld, fund_balance_wld, replayed FROM public.treasury_core_post(?::uuid, ?::uuid, ?::text, ?::text)")
                    .param(actor).param(key).param(command).param(principalWld)
                    .query().listOfRows().stream().findFirst().orElse(null);
        } catch (RuntimeException e) {
            throw translate(e);
        }
        if (receipt == null || receipt.get("ledger_transaction_id") == null || !principalWld.equals(receipt.get("principal_wld"))) {
            throw unavailable("PENSION_RECEIPT_NOT_CERTIFIED");
        }
        return receipt;
    }

    private static ResponseStatusException translate(RuntimeException e) {
        if (e instanceof ResponseStatusException rse) return rse;
        Throwable cause = NestedExceptionUtils.getMostSpecificCause(e);
        if (cause instanceof SQLException sql && sql.getSQLState() != null && REFUSALS.contains(sql.getSQLState())) {
            return new ResponseStatusException(HttpStatus.BAD_REQUEST, "PENSION_LEDGER_REFUSED");
        }
        return unavailable("PENSION_LEDGER_UNAVAILABLE");
    }

    private static ResponseStatusException unavailable(String code) {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, code);
    }
}
