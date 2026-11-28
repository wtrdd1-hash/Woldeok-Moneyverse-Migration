package com.moneyverse.api.domain.bank.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
public class PocketService {

    private static final Logger log = LoggerFactory.getLogger(PocketService.class);
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public PocketService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    /**
     * Rows from bank_owner_pockets (361), shaped as the web's SavingPocket (snake_case, money as
     * canonical integer strings). An unreadable source is a 503: an empty list would read as
     * "you have no pockets".
     */
    public List<Map<String, Object>> listPockets(String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        try {
            return jdbcTemplate.query("SELECT * FROM public.bank_owner_pockets(?::uuid)", (rs, rowNum) -> {
                Map<String, Object> pocket = new LinkedHashMap<>();
                pocket.put("pocket_id", rs.getString("pocket_id"));
                pocket.put("name", rs.getString("pocket_name"));
                pocket.put("balance", rs.getString("balance"));
                pocket.put("target_amount", rs.getString("target_amount"));
                Date td = rs.getDate("target_date");
                pocket.put("target_date", td != null ? td.toString() : null);
                pocket.put("theme_color", rs.getString("theme_color"));
                pocket.put("icon_code", rs.getString("icon_code"));
                pocket.put("is_archived", rs.getBoolean("is_archived"));
                pocket.put("created_at", rs.getTimestamp("created_at").toInstant().toString());
                pocket.put("updated_at", rs.getTimestamp("updated_at").toInstant().toString());
                return pocket;
            }, userId);
        } catch (org.springframework.dao.DataAccessException e) {
            log.warn("[PocketService] pocket list unavailable: {}", e.getClass().getSimpleName());
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "POCKETS_UNAVAILABLE");
        }
    }

    @Transactional
    public Map<String, Object> createPocket(String userIdStr, String name, Long targetAmount, String targetDateStr, String themeColor, String iconCode) {
        UUID userId = UUID.fromString(userIdStr);
        UUID pocketId = UUID.randomUUID();
        Instant now = Instant.now();
        Date targetDate = targetDateStr != null ? Date.valueOf(targetDateStr) : null;
        String color = themeColor != null ? themeColor : "#3B82F6";
        String icon = iconCode != null ? iconCode : "SAVINGS";

        String sql = """
            INSERT INTO bank_saving_pockets (id, user_id, name, balance, target_amount, target_date, theme_color, icon_code, is_archived, created_at, updated_at)
            VALUES (?, ?, ?, 0, ?, ?, ?, ?, false, ?, ?)
            """;
        jdbcTemplate.update(sql, pocketId, userId, name, targetAmount, targetDate, color, icon, Timestamp.from(now), Timestamp.from(now));

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", pocketId.toString());
        res.put("name", name);
        res.put("balance", 0L);
        res.put("targetAmount", targetAmount);
        res.put("targetDate", targetDateStr);
        res.put("themeColor", color);
        res.put("iconCode", icon);
        res.put("isArchived", false);
        return res;
    }

    @Transactional
    public Map<String, Object> transferPocket(String userIdStr, String pocketIdStr, String direction, Long amount) {
        // Security review 2026-11-25: the previous body moved pocket balances without
        // debiting or crediting cash (and zeroed balances on archive). No double-entry
        // pocket path exists, so nothing is moved or acknowledged.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "POCKET_LEDGER_NOT_JOURNALED");
    }

    @Transactional
    /**
     * Pocket appearance. bank_saving_pockets is not writable by the application role, and the old
     * UPDATE reported success even when it matched no row. bank_customize_pocket is journaled (it
     * charges its fee to the sink in the same transaction), locks the idempotency key before the
     * replay lookup and refuses another user's receipt, so the client's key is required and the
     * receipt is the only success.
     */
    public Map<String, Object> customizePocket(String userIdStr, String pocketIdStr, String themeColor, String iconCode, String idempotencyKey) {
        UUID userId = UUID.fromString(userIdStr);
        UUID pocketId;
        UUID key;
        try {
            pocketId = UUID.fromString(pocketIdStr);
            key = UUID.fromString(idempotencyKey);
        } catch (RuntimeException invalid) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "pocket id and idempotency key are required");
        }
        try {
            List<Map<String, Object>> receipt = jdbcTemplate.queryForList(
                    "SELECT pocket_id::text AS pocket_id, theme_color, icon_code, cost_wld::text AS cost_wld, remaining_cash::text AS remaining_cash "
                            + "FROM public.bank_customize_pocket(?::uuid, ?::uuid, ?::uuid, ?, ?)",
                    key, userId, pocketId, themeColor, iconCode);
            if (receipt.size() != 1) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "POCKET_CUSTOMIZE_RECEIPT_MISSING");
            }
            return receipt.get(0);
        } catch (org.springframework.dao.DataAccessException e) {
            String state = e.getMostSpecificCause() instanceof java.sql.SQLException sql ? sql.getSQLState() : null;
            org.springframework.http.HttpStatus status = switch (state == null ? "" : state) {
                case "22023", "23505", "55000" -> org.springframework.http.HttpStatus.CONFLICT;
                case "28000" -> org.springframework.http.HttpStatus.BAD_REQUEST;
                default -> org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;
            };
            throw new org.springframework.web.server.ResponseStatusException(status, "POCKET_CUSTOMIZE_REFUSED");
        }
    }

    @Transactional
    public Map<String, Object> archivePocket(String userIdStr, String pocketIdStr) {
        // Security review 2026-11-25: the previous body moved pocket balances without
        // debiting or crediting cash (and zeroed balances on archive). No double-entry
        // pocket path exists, so nothing is moved or acknowledged.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "POCKET_LEDGER_NOT_JOURNALED");
    }
}
