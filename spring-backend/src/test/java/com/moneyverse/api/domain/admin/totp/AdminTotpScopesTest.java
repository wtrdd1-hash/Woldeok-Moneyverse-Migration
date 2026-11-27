package com.moneyverse.api.domain.admin.totp;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class AdminTotpScopesTest {
    @ParameterizedTest
    @CsvSource({
            "POST,/api/v1/admin/treasury/mint-topup,economy.treasury",
            "PUT,/api/admin/treasury/swf,economy.treasury",
            "POST,/api/admin/fx/intervene,economy.treasury",
            "POST,/api/admin/kdic/payout,economy.treasury",
            "POST,/api/admin/pension/distribute-payouts,economy.treasury",
            "POST,/api/admin/enterprises/x/dividends/disburse,economy.treasury",
            "POST,/api/admin/security/abuse/suspend-permanent,member.lifecycle",
            "DELETE,/api/admin/security/abuse/unblock/x,member.lifecycle",
            "POST,/api/admin/security/forced-logouts,security.settings",
            "POST,/api/admin/controls,security.settings",
            "PUT,/api/admin/controls/feature-switches/economy_auto_policy,security.settings",
            "POST,/api/admin/operations/maintenance,security.settings",
            "POST,/api/admin/backups/trigger,backup.restore"
    })
    void mapsHighRiskWrites(String method, String path, String scope) {
        assertEquals(Optional.of(scope), AdminTotpScopes.scopeFor(method, path));
    }

    @ParameterizedTest
    @CsvSource({
            "GET,/api/admin/treasury/x",
            "HEAD,/api/admin/backups/trigger",
            "OPTIONS,/api/admin/treasury/mint-topup",
            "POST,/api/admin/shop/items",
            "POST,/api/admin/support/threads/x/messages",
            "POST,/api/v1/admin/security/sessions",
            "DELETE,/api/admin/security/sessions",
            "POST,/api/v1/admin/security/totp/verify",
            "DELETE,/api/admin/security/totp",
            "POST,/api/admin/treasuryx",
            "POST,/api/admin/controlsx"
    })
    void leavesOtherRequestsUnscoped(String method, String path) {
        assertEquals(Optional.empty(), AdminTotpScopes.scopeFor(method, path));
    }

    @Test
    void normalisedSpellingsMapToSameScope() {
        assertEquals(AdminTotpScopes.scopeFor("POST", "/api/admin/treasury/mint-topup"),
                AdminTotpScopes.scopeFor("POST", "/api/v1/admin/treasury/mint-topup"));
        assertEquals(AdminTotpScopes.scopeFor("POST", "/api/admin/backups/trigger"),
                AdminTotpScopes.scopeFor("post", "/api/v1/admin/backups/trigger"));
    }

    @Test
    void nullInputsAreUnscoped() {
        assertEquals(Optional.empty(), AdminTotpScopes.scopeFor(null, "/api/admin/treasury/x"));
        assertEquals(Optional.empty(), AdminTotpScopes.scopeFor("POST", null));
    }

    @Test
    void everyMappedScopeIsKnownToTheDatabase() {
        assertTrue(AdminTotpScopes.SCOPES.containsAll(java.util.List.of("totp.manage", "role.manage", "economy.treasury",
                "member.lifecycle", "security.settings", "backup.restore")));
        assertEquals(6, AdminTotpScopes.SCOPES.size());
    }
}
