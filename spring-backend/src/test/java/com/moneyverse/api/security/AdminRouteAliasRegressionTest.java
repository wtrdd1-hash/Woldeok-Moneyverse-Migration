package com.moneyverse.api.security;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security review 2026-11-25 (critical): TreasuryAdminController mapped its writes
 * (mint top-up, salary, SWF policy/rebalance/liquidate) also under /api/treasury/**,
 * outside AdminApiBoundaryFilter (/api/admin, /api/v1/admin). An anonymous
 * POST /api/treasury/swf/rebalance executed. Every write on an admin controller must
 * live under the admin prefix the filter guards.
 */
class AdminRouteAliasRegressionTest {
    @Test void adminControllerWritesOnlyLiveUnderTheGuardedPrefix() throws Exception {
        List<String> bad = new ArrayList<>();
        int scanned = 0;
        for (var r : new PathMatchingResourcePatternResolver().getResources("classpath*:com/moneyverse/**/*Controller.class")) {
            String path = r.getURL().getPath();
            String cls = path.substring(path.indexOf("com/moneyverse/")).replace('/', '.').replace(".class", "");
            if (!cls.contains("Admin")) continue;
            Class<?> c = Class.forName(cls);
            scanned++;
            RequestMapping base = c.getAnnotation(RequestMapping.class);
            String[] prefixes = base == null ? new String[]{""} : (base.value().length > 0 ? base.value() : base.path().length > 0 ? base.path() : new String[]{""});
            for (Method m : c.getDeclaredMethods()) {
                String[] subs = null;
                if (m.isAnnotationPresent(PostMapping.class)) { var a = m.getAnnotation(PostMapping.class); subs = a.value().length > 0 ? a.value() : a.path(); }
                if (m.isAnnotationPresent(PutMapping.class)) { var a = m.getAnnotation(PutMapping.class); subs = a.value().length > 0 ? a.value() : a.path(); }
                if (m.isAnnotationPresent(PatchMapping.class)) { var a = m.getAnnotation(PatchMapping.class); subs = a.value().length > 0 ? a.value() : a.path(); }
                if (m.isAnnotationPresent(DeleteMapping.class)) { var a = m.getAnnotation(DeleteMapping.class); subs = a.value().length > 0 ? a.value() : a.path(); }
                if (subs == null) continue;
                if (subs.length == 0) subs = new String[]{""};
                for (String p : prefixes) for (String s : subs) {
                    String full = p + s;
                    if (!full.matches("^/(api/(v1/)?)?admin/.*")) bad.add(c.getSimpleName() + "." + m.getName() + " " + full);
                }
            }
        }
        assertTrue(scanned > 10, "scanned " + scanned);
        assertEquals(List.of(), bad);
    }
}
