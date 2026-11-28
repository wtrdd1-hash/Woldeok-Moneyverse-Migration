package com.moneyverse.api.domain.admin.totp;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Which administrator writes need a second-factor proof, and for which scope. Explicit and
 * prefix-based on the already-normalised path, so widening coverage is a reviewed diff to this
 * table and its test rather than an annotation that can be forgotten on one controller. Writes not
 * listed keep today's rule (verified role, CSRF and password step-up).
 *
 * {@code role.manage} has no Spring route yet; it is in the database's scope list so a later
 * role-management route can be mapped without a migration.
 */
public final class AdminTotpScopes {
    public static final Set<String> SCOPES = Set.of("totp.manage", "role.manage", "economy.treasury",
            "member.lifecycle", "security.settings", "backup.restore");

    /** Exempt prefixes are checked first: the factor's own endpoints and console open/close. */
    private static final List<String> EXEMPT = List.of("/api/admin/security/totp", "/api/admin/security/sessions");

    /** Most specific first; an entry matches the path itself or anything below it. */
    private static final List<Map.Entry<String, String>> PREFIXES = List.of(
            Map.entry("/api/admin/security/abuse", "member.lifecycle"),
            Map.entry("/api/admin/security", "security.settings"),
            Map.entry("/api/admin/controls", "security.settings"),
            Map.entry("/api/admin/operations", "security.settings"),
            Map.entry("/api/admin/treasury", "economy.treasury"),
            Map.entry("/api/admin/fx", "economy.treasury"),
            Map.entry("/api/admin/kdic", "economy.treasury"),
            Map.entry("/api/admin/pension", "economy.treasury"),
            Map.entry("/api/admin/enterprises", "economy.treasury"),
            Map.entry("/api/admin/backups", "backup.restore"));

    private AdminTotpScopes() {}

    public static Optional<String> scopeFor(String method, String normalisedPath) {
        if (method == null || normalisedPath == null) return Optional.empty();
        String m = method.toUpperCase(Locale.ROOT);
        if (m.equals("GET") || m.equals("HEAD") || m.equals("OPTIONS")) return Optional.empty();
        // Three spellings reach the same controllers: /api/v1/admin, /api/admin and the older
        // /admin JSON aliases. All are judged as /api/admin, or an alias would skip the factor.
        String path = normalisedPath;
        if (path.startsWith("/api/v1/")) path = "/api/" + path.substring("/api/v1/".length());
        else if (path.startsWith("/admin/") || path.equals("/admin")) path = "/api" + path;
        for (String exempt : EXEMPT) if (under(path, exempt)) return Optional.empty();
        for (var entry : PREFIXES) if (under(path, entry.getKey())) return Optional.of(entry.getValue());
        return Optional.empty();
    }

    private static boolean under(String path, String prefix) {
        return path.equals(prefix) || path.startsWith(prefix + "/");
    }
}
