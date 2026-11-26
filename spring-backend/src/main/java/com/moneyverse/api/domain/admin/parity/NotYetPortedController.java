package com.moneyverse.api.domain.admin.parity;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Routes the Next frontend calls that Spring does not serve yet (route contract 2026-11-26).
 * They answered 404, so admin and member screens crashed or showed nothing. Each now answers an
 * explicit 503 with a stable code until it is ported from NestJS with its DB function; nothing
 * here reads or writes data. Money-moving admin actions (mint, retire, treasury inject/drain,
 * bulk payouts, reversals, overrides) deliberately stay here until their dual-control flows are
 * ported whole. Admin paths remain behind AdminApiBoundaryFilter; member paths behind the
 * session filter where listed there.
 */
@RestController
public class NotYetPortedController {
    private static ResponseEntity<Map<String, Object>> unavailable(String code) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).header("Cache-Control", "private, no-store")
                .body(Map.of("ok", false, "code", code, "message", "This action is not available yet"));
    }

    @RequestMapping(path = {
            "/api/v1/admin/stocks/{p1}",
            "/api/v1/admin/ai-news/models",
            "/api/v1/admin/bank",
            "/api/v1/admin/blog-verified/publisher-status",
            "/api/v1/admin/bonds/distribute-coupons",
            "/api/v1/admin/bonds/issues",
            "/api/v1/admin/discord",
            "/api/v1/admin/economy/council-debate",
            "/api/v1/admin/economy/monetary/telemetry",
            "/api/v1/admin/economy/tax-policy/auto-adjust",
            "/api/v1/admin/economy/velocity",
            "/api/v1/admin/enterprises/overview",
            "/api/v1/admin/help/articles/{p1}/{p2}",
            "/api/v1/admin/operations/storage",
            "/api/v1/admin/pension/overview",
            "/api/v1/admin/pension/recent-payouts",
            "/api/v1/admin/photos/submissions",
            "/api/v1/admin/support/threads/{p1}/status",
            "/api/v1/admin/treasury/grants",
            "/api/v1/admin/work",
            "/api/v1/admin/ai-news/auto-generate",
            "/api/v1/admin/ai-news/batches",
            "/api/v1/admin/ai-news/scenarios/{p1}/discard",
            "/api/v1/admin/ai-news/scenarios/{p1}/publish",
            "/api/v1/admin/announcements",
            "/api/v1/admin/announcements/{p1}",
            "/api/v1/admin/audit/retention/{p1}",
            "/api/v1/admin/audit/verify",
            "/api/v1/admin/blog-verified",
            "/api/v1/admin/business-types/{p1}",
            "/api/v1/admin/controls/auto-policy/runs",
            "/api/v1/admin/controls/consent-versions",
            "/api/v1/admin/economy/bulk-payouts",
            "/api/v1/admin/economy/killswitch",
            "/api/v1/admin/economy/knobs-v2",
            "/api/v1/admin/economy/monetary/execute-mint",
            "/api/v1/admin/economy/monetary/execute-retire",
            "/api/v1/admin/economy/monetary/orders/{p1}/approve",
            "/api/v1/admin/economy/monetary/orders/propose",
            "/api/v1/admin/economy/transactions/{p1}/reversal",
            "/api/v1/admin/economy/users/{p1}/override-v2",
            "/api/v1/admin/photos/{p1}/approval",
            "/api/v1/admin/photos/metadata",
            "/api/v1/admin/season-events/{p1}",
            "/api/v1/admin/security/ip-blocks/{p1}",
            "/api/v1/admin/security/users/{p1}/permanent-suspension",
            "/api/v1/admin/stocks/{p1}/corporate-actions",
            "/api/v1/admin/stocks/{p1}/price",
            "/api/v1/admin/treasury/drain",
            "/api/v1/admin/treasury/inject",
            "/api/v1/admin/treasury/swf/config",
            "/api/v1/admin/users/{p1}/restriction",
            "/api/v1/admin/work/policy",
            "/api/v1/admin/work/tasks/{p1}"
    })
    public ResponseEntity<Map<String, Object>> admin() {
        return unavailable("ADMIN_ACTION_NOT_AVAILABLE");
    }

    @RequestMapping(path = {
            "/api/v1/bonds/holdings/{p1}/rollover",
            "/api/v1/engagement/dopamine/attendance/spin",
            "/api/v1/engagement/dopamine/attendance/status",
            "/api/v1/enterprises/public",
            "/api/v1/seo/gsc/digest-report",
            "/api/v1/seo/metadata",
            "/api/v1/support/threads/{p1}/transcript",
            "/api/v1/support/threads/{p1}/transcript/text",
            "/api/v1/auth/{p1}/reauthentication",
            "/api/v1/businesses/{p1}/boost",
            "/api/v1/chat/conversations/{p1}/archive",
            "/api/v1/chat/conversations/{p1}/mute",
            "/api/v1/chat/conversations/{p1}/read",
            "/api/v1/chat/users/{p1}/block",
            "/api/v1/engagement/preferences",
            "/api/v1/pension/liquidate",
            "/api/v1/seo/gsc/credentials",
            "/api/v1/seo/gsc/credentials/delete",
            "/api/v1/seo/gsc/sitemap",
            "/api/v1/seo/twitter/test-tweet"
    })
    public ResponseEntity<Map<String, Object>> member() {
        return unavailable("FEATURE_NOT_AVAILABLE");
    }
}
