package com.moneyverse.api.domain.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.sql.ResultSet;
import java.sql.SQLException;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Service
public class AdminGovernanceService {

    private static final Logger log = LoggerFactory.getLogger(AdminGovernanceService.class);

    private static UUID requireActor(UUID actor) {
        if (actor == null) { actor = UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20"); }
        return actor;
    }

    private static String requiredAmount(ResultSet rs, String column) throws SQLException {
        String value = rs.getString(column);
        if (value == null) throw new IllegalStateException("UNKNOWN_FINANCIAL_FIELD: " + column);
        return value;
    }

    private static ResponseStatusException sourceUnavailable(String source) {
        log.warn("Admin canonical source unavailable: {}", source);
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ADMIN_SOURCE_UNAVAILABLE");
    }

    private final JdbcTemplate jdbcTemplate;
    private final EncryptionService encryptionService;
    private final ObjectMapper objectMapper;

    public AdminGovernanceService(JdbcTemplate jdbcTemplate, EncryptionService encryptionService, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.encryptionService = encryptionService;
        this.objectMapper = objectMapper;
    }

    /**
     * 피처 스위치 및 거버넌스 정책 현황 조회
     */
    public FeatureSwitchOverviewResponse getFeatureSwitchesOverview(UUID actorId) {
        UUID actor = requireActor(actorId);
        List<FeatureSwitchDto> switches = new ArrayList<>();
        List<Map<String, Object>> policies = new ArrayList<>();
        List<Map<String, Object>> roles = new ArrayList<>();

        try {
            String sql = "SELECT feature_key, state, title, activation_preconditions, reason, updated_by, updated_at " +
                         "FROM public.admin_list_feature_switches(?::uuid)";
            switches = jdbcTemplate.query(sql, (rs, rowNum) -> {
                FeatureSwitchDto dto = new FeatureSwitchDto();
                dto.setFeatureKey(rs.getString("feature_key"));
                dto.setState(rs.getString("state"));
                dto.setTitle(rs.getString("title"));
                dto.setReason(rs.getString("reason"));
                dto.setUpdatedBy(rs.getString("updated_by"));
                Timestamp ts = rs.getTimestamp("updated_at");
                dto.setUpdatedAt(ts != null ? ts.toInstant().toString() : Instant.now().toString());
                return dto;
            }, actor);
        } catch (Exception e) {
            throw sourceUnavailable("feature_switches");
        }

        try {
            String policySql = "SELECT policy_id, version, status, effective_at, reason FROM public.admin_list_economy_policies(?::uuid, 30)";
            policies = jdbcTemplate.query(policySql, (rs, rowNum) -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("policyId", rs.getString("policy_id"));
                map.put("version", rs.getString("version"));
                map.put("status", rs.getString("status"));
                Timestamp ts = rs.getTimestamp("effective_at");
                map.put("effectiveAt", ts != null ? ts.toInstant().toString() : null);
                map.put("reason", rs.getString("reason"));
                return map;
            }, actor);
        } catch (Exception e) {
            throw sourceUnavailable("economy_policies");
        }

        return new FeatureSwitchOverviewResponse(switches, policies, roles);
    }

    /**
     * 피처 스위치 상태 변경 (킬스위치 제어)
     */
    @Transactional
    public Map<String, Object> setFeatureSwitch(UUID actorId, String featureKey, SetFeatureSwitchRequest request) {
        UUID actor = requireActor(actorId);
        if (request == null || request.getIdempotencyKey() == null || request.getIdempotencyKey().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "IDEMPOTENCY_KEY_REQUIRED");
        }
        UUID idempotencyKey;
        try { idempotencyKey = UUID.fromString(request.getIdempotencyKey()); }
        catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_IDEMPOTENCY_KEY");
        }

        log.info("[AdminGovernance] setFeatureSwitch: key={}, state={}, reason={}, actor={}",
                featureKey, request.getState(), request.getReason(), actor);

        try {
            String sql = "SELECT feature_key, previous_state, next_state FROM public.admin_set_feature_switch(?::uuid, ?::uuid, ?::text, ?::text, ?::text)";
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("featureKey", rs.getString("feature_key"));
                map.put("previousState", rs.getString("previous_state"));
                map.put("nextState", rs.getString("next_state"));
                return map;
            }, idempotencyKey, actor, featureKey, request.getState(), request.getReason());
        } catch (Exception e) {
            // Never bypass the audited administrator stored procedure with direct table DML.
            throw sourceUnavailable("feature_switch_mutation");
        }
    }

    /**
     * 회원 명부 조회 및 AES-256-GCM 복호화
     */
    public AdminUsersResponse listUsers(UUID actorId, int limit) {
        UUID actor = requireActor(actorId);
        int safeLimit = Math.max(1, Math.min(limit, 200));

        List<AdminUserDto> users = new ArrayList<>();
        Map<String, Object> scope = new LinkedHashMap<>();
        scope.put("kind", "WEALTH_ORDERED_SNAPSHOT");
        scope.put("limit", safeLimit);

        try {
            String sql = "SELECT user_id::text, status, display_name, created_at, restricted_at, restriction_reason, " +
                         "cash_balance, bank_balance, bond_balance, stock_eval, total_net_worth, wealth_rank " +
                         "FROM public.admin_list_users(?::uuid, ?::int)";
            users = jdbcTemplate.query(sql, (rs, rowNum) -> {
                AdminUserDto dto = new AdminUserDto();
                dto.setUserId(rs.getString("user_id"));
                dto.setStatus(rs.getString("status"));
                String rawName = rs.getString("display_name");
                dto.setDisplayName(encryptionService.decrypt(rawName));
                Timestamp createdAt = rs.getTimestamp("created_at");
                if (createdAt == null) throw new IllegalStateException("ADMIN_USER_CREATED_AT_MISSING");
                dto.setCreatedAt(createdAt.toInstant().toString());
                Timestamp restrictedAt = rs.getTimestamp("restricted_at");
                dto.setRestrictedAt(restrictedAt != null ? restrictedAt.toInstant().toString() : null);
                dto.setRestrictionReason(rs.getString("restriction_reason"));
                dto.setCashBalance(requiredAmount(rs, "cash_balance"));
                dto.setBankBalance(requiredAmount(rs, "bank_balance"));
                dto.setBondBalance(requiredAmount(rs, "bond_balance"));
                dto.setStockEval(requiredAmount(rs, "stock_eval"));
                dto.setTotalNetWorth(requiredAmount(rs, "total_net_worth"));
                int rank = rs.getInt("wealth_rank");
                dto.setWealthRank(rs.wasNull() ? null : rank);
                return dto;
            }, actor, safeLimit);

            // Populate access summaries (last login, seen, admin)
            try {
                String accessSql = "SELECT user_id::text, last_login_at, last_seen_at, last_admin_at FROM public.activity_user_access_summaries(?::uuid)";
                Map<String, Map<String, Object>> summaries = new HashMap<>();
                jdbcTemplate.query(accessSql, (rs, rowNum) -> {
                    Map<String, Object> s = new HashMap<>();
                    Timestamp ll = rs.getTimestamp("last_login_at");
                    s.put("last_login_at", ll != null ? ll.toInstant().toString() : null);
                    Timestamp ls = rs.getTimestamp("last_seen_at");
                    s.put("last_seen_at", ls != null ? ls.toInstant().toString() : null);
                    Timestamp la = rs.getTimestamp("last_admin_at");
                    s.put("last_admin_at", la != null ? la.toInstant().toString() : null);
                    summaries.put(rs.getString("user_id"), s);
                    return null;
                }, actor);

                for (AdminUserDto u : users) {
                    Map<String, Object> s = summaries.get(u.getUserId());
                    if (s != null) {
                        u.setLastLoginAt((String) s.get("last_login_at"));
                        u.setLastSeenAt((String) s.get("last_seen_at"));
                        u.setLastAdminAt((String) s.get("last_admin_at"));
                        // Administrator role is not proven by last admin activity.
                    }
                }
            } catch (Exception ex) {
                throw sourceUnavailable("user_access_summaries");
            }

        } catch (Exception e) {
            throw sourceUnavailable("admin_list_users");
        }

        scope.put("hasMore", users.size() >= safeLimit);
        return new AdminUsersResponse(users, scope);
    }

    /**
     * 상장 주식 관리 목록 조회
     */
    public AdminStocksResponse listStocks(UUID actorId) {
        requireActor(actorId);
        List<AdminStockDto> stocks = new ArrayList<>();
        try {
            String sql = "SELECT id::text, symbol, name, current_price::text, halt_status, description " +
                         "FROM public.stock_market_overview() ORDER BY symbol ASC";
            stocks = jdbcTemplate.query(sql, (rs, rowNum) -> {
                AdminStockDto dto = new AdminStockDto();
                dto.setId(rs.getString("id"));
                dto.setSymbol(rs.getString("symbol"));
                dto.setName(rs.getString("name"));
                dto.setCurrentPrice(requiredAmount(rs, "current_price"));
                String haltStatus = rs.getString("halt_status");
                if (haltStatus == null) throw new IllegalStateException("STOCK_HALT_STATUS_UNKNOWN");
                dto.setActive("ACTIVE".equalsIgnoreCase(haltStatus));
                dto.setHaltStatus(haltStatus);
                dto.setHaltReason(rs.getString("description"));
                return dto;
            });
        } catch (Exception e) {
            throw sourceUnavailable("admin_stocks");
        }
        return new AdminStocksResponse(stocks);
    }

    /**
     * 최신 경제 원장 복식부기 건전성 스냅샷 조회
     */
    public EconomyReconciliationHealthDto getLatestReconciliationHealth(UUID actorId) {
        UUID actor = requireActor(actorId);
        EconomyReconciliationHealthDto dto = new EconomyReconciliationHealthDto();

        try {
            String sql = "SELECT snapshot_id::text, metric_version, calculated_at, integrity_ok, " +
                         "ledger_transaction_count::text, ledger_posting_count::text, " +
                         "ledger_unbalanced_transaction_count::text, missing_balance_account_count::text, " +
                         "balance_mismatch_account_count::text, disallowed_negative_balance_account_count::text, " +
                         "account_balance_total_amount::text, ledger_balance_total_amount::text, " +
                         "balance_total_delta_amount::text " +
                         "FROM public.admin_latest_economy_reconciliation_health(?::uuid)";

            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                EconomyReconciliationHealthDto h = new EconomyReconciliationHealthDto();
                h.setAvailable(true);
                h.setSnapshotId(rs.getString("snapshot_id"));
                h.setMetricVersion(rs.getString("metric_version"));
                Timestamp ts = rs.getTimestamp("calculated_at");
                h.setCalculatedAt(ts != null ? ts.toInstant().toString() : Instant.now().toString());

                EconomyReconciliationHealthDto.IntegrityDto integrity = new EconomyReconciliationHealthDto.IntegrityDto();
                integrity.setOk(rs.getBoolean("integrity_ok"));
                integrity.setLedgerTransactionCount(requiredAmount(rs, "ledger_transaction_count"));
                integrity.setLedgerPostingCount(requiredAmount(rs, "ledger_posting_count"));
                integrity.setUnbalancedTransactionCount(requiredAmount(rs, "ledger_unbalanced_transaction_count"));
                integrity.setMissingBalanceAccountCount(requiredAmount(rs, "missing_balance_account_count"));
                integrity.setBalanceMismatchAccountCount(requiredAmount(rs, "balance_mismatch_account_count"));
                integrity.setDisallowedNegativeBalanceAccountCount(requiredAmount(rs, "disallowed_negative_balance_account_count"));
                integrity.setAccountBalanceTotalAmount(requiredAmount(rs, "account_balance_total_amount"));
                integrity.setLedgerBalanceTotalAmount(requiredAmount(rs, "ledger_balance_total_amount"));
                integrity.setBalanceTotalDeltaAmount(requiredAmount(rs, "balance_total_delta_amount"));

                h.setIntegrity(integrity);
                return h;
            }, actor);

        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            // Authenticated actor, source call succeeded but no record: no healthy snapshot.
            dto.setAvailable(false);
            return dto;
        } catch (Exception e) {
            // A missing reconciliation report is UNKNOWN, never a healthy zero-delta ledger.
            throw sourceUnavailable("ledger_reconciliation");
        }
    }
}
