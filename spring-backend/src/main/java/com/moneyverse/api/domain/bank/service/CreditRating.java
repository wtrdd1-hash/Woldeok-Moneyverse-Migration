package com.moneyverse.api.domain.bank.service;

import java.math.BigInteger;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Game-only credit score, ported unchanged from the NestJS credit-rating.service so the
 * numbers members saw do not shift with the backend. Inputs come from the DB
 * (bank_get_my_standing, bank_my_credit_facts); nothing here is persisted or fabricated.
 */
public final class CreditRating {
    private CreditRating() {}

    private record Tier(String nameKo, int minScore, int limitWld, int rateBps, int maxInstallments) {}

    private static final Tier[] TIERS = {
            new Tier("최상위 우량 (Prime AAA)", 900, 500_000, 350, 12),
            new Tier("우량 1급 (Prime AA)", 820, 400_000, 400, 12),
            new Tier("우량 2급 (Prime A)", 750, 300_000, 450, 10),
            new Tier("준우량 (Standard B+)", 680, 250_000, 520, 8),
            new Tier("일반 1급 (Standard B)", 600, 200_000, 600, 6),
            new Tier("일반 2급 (Standard B-)", 520, 150_000, 680, 6),
            new Tier("주의 1급 (Moderate C+)", 440, 100_000, 750, 4),
            new Tier("주의 2급 (Moderate C)", 360, 50_000, 850, 3),
            new Tier("관리 필요 (Watch D)", 280, 20_000, 1000, 2),
            new Tier("회복 지원 대상 (Recovery Required)", 0, 0, 0, 0),
    };

    /** NestJS toCreditScoreAssets: a canonical integer string, capped at 75,000 for scoring. */
    public static long capAssets(Object raw) {
        String text = raw == null ? null : raw.toString();
        if (text == null || !text.matches("^[0-9]+(?:\\.0+)?$")) throw new IllegalArgumentException("invalid credit score asset amount");
        BigInteger amount = new BigInteger(text.split("\\.")[0]);
        return amount.compareTo(BigInteger.valueOf(75_000)) > 0 ? 75_000L : amount.longValue();
    }

    public static Map<String, Object> evaluate(int accountAgeDays, int jobLevel, long cash, long deposit, int repayments, int overdue) {
        int base = 500;
        int activity = (int) Math.min(100, Math.floor(accountAgeDays * 2.0));
        int job = Math.min(150, jobLevel * 15);
        long assets = cash + deposit;
        int wealth = (int) Math.min(150, (assets / 5000) * 10);
        int repayment = Math.min(150, repayments * 25);
        int overduePenalty = Math.min(300, overdue * 100);
        int score = Math.max(100, Math.min(1000, base + activity + job + wealth + repayment - overduePenalty));
        int tier = 10;
        for (int t = 1; t <= 10; t++) {
            if (score >= TIERS[t - 1].minScore()) { tier = t; break; }
        }
        Tier info = TIERS[tier - 1];
        Map<String, Object> factors = new LinkedHashMap<>();
        factors.put("baseScore", base);
        factors.put("activityBonus", activity);
        factors.put("jobBonus", job);
        factors.put("wealthBonus", wealth);
        factors.put("repaymentBonus", repayment);
        factors.put("overduePenalty", overduePenalty);
        factors.put("riskSpendPenalty", 0);
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("score", score);
        r.put("tier", tier);
        r.put("tierNameKo", info.nameKo());
        r.put("creditLimitWld", info.limitWld());
        r.put("interestRateBps", info.rateBps());
        r.put("maxInstallments", info.maxInstallments());
        r.put("factors", factors);
        if (tier == 10) {
            r.put("recoveryGuidance", "현재 연체 또는 과도한 채무로 인해 신규 대출이 일시 유예되었습니다. 직업 퀘스트 수행 및 분할 상환을 통해 신용 점수를 빠르게 회복할 수 있습니다.");
        } else if (tier >= 8) {
            r.put("recoveryGuidance", "소액 단기 대출을 성실히 상환하고 정기 저축을 유지하면 상위 등급으로 승급되어 우대 금리가 적용됩니다.");
        }
        r.put("simulatedNotice", "본 신용평가는 머니버스 게임 내 가상 자산(WLD) 전용 학습 시뮬레이션이며, 실제 금융기관의 신용등급이나 대출과 무관합니다.");
        return r;
    }
}
