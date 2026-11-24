package com.moneyverse.api.domain.bank.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.bank.dto.BankDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

@Service
public class BankService {

    private static final Logger log = LoggerFactory.getLogger(BankService.class);
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public BankService(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public BankStanding getStanding(String userId) {
        UUID uid = parseUuid(userId);
        try {
            String jsonRaw = jdbcTemplate.queryForObject(
                "SELECT public.bank_get_my_standing(?::uuid)::text",
                String.class,
                uid
            );
            if (jsonRaw != null && !jsonRaw.isBlank()) {
                Map<String, Object> data = objectMapper.readValue(jsonRaw, new TypeReference<Map<String, Object>>() {});
                BankStanding standing = new BankStanding();
                standing.setCashBalanceWld(String.valueOf(data.getOrDefault("cash_balance", "0")));
                standing.setDepositBalanceWld(String.valueOf(data.getOrDefault("bank_balance", "0")));
                standing.setAccruedInterestWld(String.valueOf(data.getOrDefault("unclaimed_interest", "0")));
                standing.setDepositInterestRateAnnualPercent(String.valueOf(data.getOrDefault("annual_yield_pct", "4.50")) + "%");
                standing.setDailyInterestRatePct(String.valueOf(data.getOrDefault("daily_interest_rate_pct", "0.0123")) + "%");
                standing.setCreditGrade(String.valueOf(data.getOrDefault("credit_grade", "A1")));
                standing.setCreditLimitWld(String.valueOf(data.getOrDefault("credit_limit", "5000000")));

                Object activeLoanObj = data.get("active_loan");
                if (activeLoanObj instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> loanMap = (Map<String, Object>) activeLoanObj;
                    standing.setActiveLoan(loanMap);
                    standing.setLoanBalanceWld(String.valueOf(loanMap.getOrDefault("outstanding_amount", "0")));
                } else {
                    standing.setLoanBalanceWld("0");
                }

                Object bondsObj = data.get("bonds");
                if (bondsObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> bondsList = (List<Map<String, Object>>) bondsObj;
                    standing.setBonds(bondsList);
                    long totalBonds = 0;
                    for (Map<String, Object> b : bondsList) {
                        try {
                            totalBonds += Long.parseLong(String.valueOf(b.getOrDefault("principal_amount", "0")));
                        } catch (Exception ignored) {}
                    }
                    standing.setBondHoldingsValueWld(String.valueOf(totalBonds));
                } else {
                    standing.setBonds(Collections.emptyList());
                    standing.setBondHoldingsValueWld("0");
                }
                return standing;
            }
        } catch (Exception e) {
            log.warn("[BankService] bank_get_my_standing fallback: {}", e.getMessage());
        }

        // Fallback to accounts query
        String cashBal = "0";
        String depositBal = "0";
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT a.account_type, b.available_amount AS amount
                FROM accounts a
                LEFT JOIN account_balances b ON a.id = b.account_id
                WHERE a.owner_user_id = ?::uuid
            """, uid);
            for (Map<String, Object> r : rows) {
                String type = String.valueOf(r.get("account_type"));
                String amt = String.valueOf(r.getOrDefault("amount", "0"));
                if ("USER_CASH".equals(type)) cashBal = amt;
                else if ("USER_BANK".equals(type)) depositBal = amt;
            }
        } catch (Exception ignored) {}

        BankStanding fallback = new BankStanding(cashBal, depositBal, "0", "4.50%", "0", "0");
        fallback.setDailyInterestRatePct("0.0123%");
        fallback.setCreditGrade("A1");
        fallback.setCreditLimitWld("5000000");
        fallback.setBonds(Collections.emptyList());
        return fallback;
    }

    @Transactional
    public Map<String, Object> deposit(String userId, Long amountWld, String idempotencyKey) {
        if (amountWld == null || amountWld <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amountWld must be at least 1");
        }
        UUID uid = parseUuid(userId);
        UUID key = parseOrCreateKey(idempotencyKey);

        try {
            UUID txId = jdbcTemplate.queryForObject(
                "SELECT public.bank_move_balance(?::uuid, ?::uuid, 'deposit', ?::numeric)",
                UUID.class,
                key, uid, new BigDecimal(amountWld)
            );

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("txId", txId != null ? txId.toString() : UUID.randomUUID().toString());
            res.put("userId", userId);
            res.put("amountWld", amountWld);
            res.put("direction", "deposit");
            res.put("message", "복리 정기 예금 계좌로 안전하게 입금되었습니다.");
            return res;
        } catch (DataAccessException e) {
            log.error("[BankService] deposit error: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "예금 입금 실패: " + e.getMostSpecificCause().getMessage());
        }
    }

    @Transactional
    public Map<String, Object> withdraw(String userId, Long amountWld, String idempotencyKey) {
        if (amountWld == null || amountWld <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amountWld must be at least 1");
        }
        UUID uid = parseUuid(userId);
        UUID key = parseOrCreateKey(idempotencyKey);

        try {
            UUID txId = jdbcTemplate.queryForObject(
                "SELECT public.bank_move_balance(?::uuid, ?::uuid, 'withdraw', ?::numeric)",
                UUID.class,
                key, uid, new BigDecimal(amountWld)
            );

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("txId", txId != null ? txId.toString() : UUID.randomUUID().toString());
            res.put("userId", userId);
            res.put("amountWld", amountWld);
            res.put("direction", "withdraw");
            res.put("message", "예금 인출이 완료되어 현금 지갑으로 이체되었습니다.");
            return res;
        } catch (DataAccessException e) {
            log.error("[BankService] withdraw error: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "예금 출금 실패: " + e.getMostSpecificCause().getMessage());
        }
    }

    @Transactional
    public Map<String, Object> claimInterest(String userId, String idempotencyKey) {
        UUID uid = parseUuid(userId);
        UUID key = parseOrCreateKey(idempotencyKey);

        try {
            Map<String, Object> row = jdbcTemplate.queryForMap(
                "SELECT * FROM public.bank_claim_compound_interest(?::uuid, ?::uuid)",
                uid, key
            );

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("claimedAmount", row.get("claimed_amount"));
            res.put("newBankBalance", row.get("new_bank_balance"));
            res.put("transactionId", row.get("transaction_id"));
            res.put("message", "누적된 복리 이자가 은행 예치금으로 안전하게 지급되었습니다.");
            return res;
        } catch (DataAccessException e) {
            String msg = e.getMostSpecificCause().getMessage();
            log.warn("[BankService] claimInterest notice: {}", msg);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이자 수령 실패: " + msg);
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listPockets(String userId) {
        UUID uid = parseUuid(userId);
        try {
            return jdbcTemplate.queryForList("""
                SELECT id::text, name, balance::text, target_amount::text,
                       target_date::text, theme_color, icon_code, created_at::text
                FROM public.bank_saving_pockets
                WHERE user_id = ?::uuid AND is_archived = false
                ORDER BY created_at DESC
            """, uid);
        } catch (Exception e) {
            log.warn("[BankService] listPockets fallback: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Transactional
    public Map<String, Object> createPocket(String userId, PocketCreateRequest req) {
        UUID uid = parseUuid(userId);
        UUID id = UUID.randomUUID();
        String name = req.getName() != null ? req.getName().trim() : "새 저금통";
        long target = req.getTargetAmount() != null ? req.getTargetAmount() : 100000L;
        String color = req.getThemeColor() != null ? req.getThemeColor() : "#6366F1";
        String icon = req.getIconCode() != null ? req.getIconCode() : "piggy";

        jdbcTemplate.update("""
            INSERT INTO public.bank_saving_pockets (id, user_id, name, balance, target_amount, theme_color, icon_code, is_archived, created_at, updated_at)
            VALUES (?, ?, ?, 0, ?, ?, ?, false, NOW(), NOW())
        """, id, uid, name, target, color, icon);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("id", id.toString());
        res.put("name", name);
        res.put("targetAmount", target);
        res.put("message", "새 비상금 저금통 팟이 생성되었습니다.");
        return res;
    }

    @Transactional
    public Map<String, Object> transferPocket(String userId, UUID pocketId, String direction, Long amountWld, String idempotencyKey) {
        if (amountWld == null || amountWld <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amountWld must be positive");
        }
        UUID uid = parseUuid(userId);
        UUID key = parseOrCreateKey(idempotencyKey);

        try {
            UUID txId = jdbcTemplate.queryForObject(
                "SELECT public.bank_transfer_pocket(?::uuid, ?::uuid, ?::uuid, ?, ?::numeric)",
                UUID.class,
                key, uid, pocketId, direction, new BigDecimal(amountWld)
            );

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("txId", txId != null ? txId.toString() : UUID.randomUUID().toString());
            res.put("message", "저금통으로 보관금이 성공적으로 이동되었습니다.");
            return res;
        } catch (DataAccessException e) {
            log.error("[BankService] transferPocket error: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "저금통 이체 실패: " + e.getMostSpecificCause().getMessage());
        }
    }

    @Transactional
    public Map<String, Object> borrowSmart(String userId, Long principalAmount, String idempotencyKey) {
        if (principalAmount == null || principalAmount <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "principalAmount must be positive");
        }
        UUID uid = parseUuid(userId);
        UUID key = parseOrCreateKey(idempotencyKey);

        try {
            UUID loanId = jdbcTemplate.queryForObject(
                "SELECT public.bank_borrow_smart(?::uuid, ?::uuid, ?::numeric)",
                UUID.class,
                key, uid, new BigDecimal(principalAmount)
            );

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("loanId", loanId != null ? loanId.toString() : UUID.randomUUID().toString());
            res.put("principalAmount", principalAmount);
            res.put("message", "가상 신용 대출이 성공적으로 승인되어 현금 지갑으로 입금되었습니다.");
            return res;
        } catch (DataAccessException e) {
            log.error("[BankService] borrowSmart error: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "대출 실행 실패: " + e.getMostSpecificCause().getMessage());
        }
    }

    @Transactional
    public Map<String, Object> repayLoan(String userId, UUID loanId, Long amountWld, String idempotencyKey) {
        if (amountWld == null || amountWld <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amountWld must be positive");
        }
        UUID uid = parseUuid(userId);
        UUID key = parseOrCreateKey(idempotencyKey);

        try {
            UUID txId = jdbcTemplate.queryForObject(
                "SELECT public.bank_repay(?::uuid, ?::uuid, ?::uuid, ?::numeric)",
                UUID.class,
                key, uid, loanId, new BigDecimal(amountWld)
            );

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("txId", txId != null ? txId.toString() : UUID.randomUUID().toString());
            res.put("amountWld", amountWld);
            res.put("message", "대출 원리금 상환이 성공적으로 완료되었습니다.");
            return res;
        } catch (DataAccessException e) {
            log.error("[BankService] repayLoan error: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "상환 실패: " + e.getMostSpecificCause().getMessage());
        }
    }

    private static UUID parseUuid(String id) {
        try {
            return UUID.fromString(id.trim());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format: " + id);
        }
    }

    private static UUID parseOrCreateKey(String key) {
        if (key != null && !key.isBlank()) {
            try {
                return UUID.fromString(key.trim());
            } catch (Exception ignored) {}
        }
        return UUID.randomUUID();
    }
}
