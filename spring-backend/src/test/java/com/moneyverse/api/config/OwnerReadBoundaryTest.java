package com.moneyverse.api.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/** Owner-scoped reads added 2026-11-25 sit behind the session filter (forged actor header -> 403). */
class OwnerReadBoundaryTest {
    @Test void ownerReadsAreMemberPrivate() {
        for (String p : new String[]{"/api/v1/engagement", "/api/v1/engagement/early-game", "/api/v1/early-game/today",
                "/api/v1/business-types", "/api/v1/business-types/x/purchases", "/api/v1/business-equity", "/api/v1/rewards/availability",
                "/api/v1/wallet/activity", "/api/v1/wallet/activity/transactions/x", "/api/v1/businesses/my-v2", "/api/v1/shop/holdings",
                "/app-api/v1/wallet/activity", "/api/v1/banking/deposit", "/api/v1/bank/movements", "/api/banking/borrow", "/api/v1/bank/loans/x/repayments"}) {
            assertTrue(SensitiveApiBoundaryFilter.isMemberPrivatePath(p), p);
        }
        assertFalse(SensitiveApiBoundaryFilter.isMemberPrivatePath("/api/v1/wallet/summary"));
    }
}
