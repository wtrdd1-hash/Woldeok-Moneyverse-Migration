package com.moneyverse.api.domain.identity;

import com.moneyverse.api.domain.identity.controller.LocalAuthController;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.GetMapping;

import java.lang.reflect.Method;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

/**
 * S04 defensive review: GET /api/v1/auth/session-token-login bound any valid session token from the
 * query string onto the caller's cookie and redirected to any "/"-prefixed target, including a
 * protocol-relative one. No client calls it. It is removed rather than patched: a session token
 * must never travel in a URL.
 */
class SessionTokenLoginRemovedTest {
    @Test void noRouteBindsASessionTokenFromAUrl() {
        for (Method m : LocalAuthController.class.getDeclaredMethods()) {
            GetMapping get = m.getAnnotation(GetMapping.class);
            if (get == null) continue;
            String[] paths = get.path().length > 0 ? get.path() : get.value();
            assertTrue(Arrays.stream(paths).noneMatch(p -> p.contains("session-token-login")), m.getName());
        }
    }

    @Test void theBindingHelperIsGone() {
        assertTrue(Arrays.stream(UserAuthService.class.getDeclaredMethods())
                .noneMatch(m -> m.getName().equals("bindExistingSessionByToken")));
    }
}
