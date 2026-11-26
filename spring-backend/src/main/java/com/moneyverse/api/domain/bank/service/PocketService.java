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
    public List<Map<String, Object>> listPockets(String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        String sql = """
            SELECT id, name, balance, target_amount, target_date, theme_color, icon_code, is_archived, created_at
            FROM bank_saving_pockets
            WHERE user_id = ? AND is_archived = false
            ORDER BY created_at ASC
            """;
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> pocket = new LinkedHashMap<>();
                pocket.put("id", rs.getString("id"));
                pocket.put("name", rs.getString("name"));
                pocket.put("balance", rs.getLong("balance"));
                pocket.put("targetAmount", rs.getObject("target_amount"));
                Date td = rs.getDate("target_date");
                pocket.put("targetDate", td != null ? td.toString() : null);
                pocket.put("themeColor", rs.getString("theme_color"));
                pocket.put("iconCode", rs.getString("icon_code"));
                pocket.put("isArchived", rs.getBoolean("is_archived"));
                Timestamp cat = rs.getTimestamp("created_at");
                pocket.put("createdAt", cat != null ? cat.toInstant().toString() : null);
                return pocket;
            }, userId);
        } catch (Exception e) {
            log.error("[PocketService] listPockets error: {}", e.getMessage());
            return List.of();
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
    public Map<String, Object> customizePocket(String userIdStr, String pocketIdStr, String themeColor, String iconCode) {
        UUID userId = UUID.fromString(userIdStr);
        UUID pocketId = UUID.fromString(pocketIdStr);

        jdbcTemplate.update(
            "UPDATE bank_saving_pockets SET theme_color = ?, icon_code = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
            themeColor, iconCode, pocketId, userId
        );

        return Map.of("success", true, "pocketId", pocketId.toString(), "themeColor", themeColor, "iconCode", iconCode);
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
