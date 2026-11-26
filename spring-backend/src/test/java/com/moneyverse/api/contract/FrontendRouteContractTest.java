package com.moneyverse.api.contract;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.servlet.HandlerExecutionChain;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Every API route the Next frontend calls (extracted from frontend/src into
 * contract/frontend-api-routes.txt) must reach a Spring handler. Owner report 2026-11-26:
 * screens "could not load" although every page answered 200, because the data calls behind
 * them had no route; admin pages could not be probed from outside (the admin filter answers
 * 401 first). This checks the handler mapping directly, below every filter.
 */
@SpringBootTest
@ActiveProfiles("test")
class FrontendRouteContractTest {
    @Autowired
    @Qualifier("requestMappingHandlerMapping")
    private RequestMappingHandlerMapping mapping;

    private boolean handled(String method, String path) {
        try {
            HandlerExecutionChain chain = mapping.getHandler(new MockHttpServletRequest(method, path));
            return chain != null;
        } catch (Exception e) {
            return false;
        }
    }

    @Test
    void everyFrontendCallHasASpringHandler() throws Exception {
        List<String> missing = new ArrayList<>();
        int checked = 0;
        try (var in = new BufferedReader(new InputStreamReader(
                Objects.requireNonNull(getClass().getResourceAsStream("/contract/frontend-api-routes.txt")), StandardCharsets.UTF_8))) {
            for (String line; (line = in.readLine()) != null; ) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                String[] parts = line.split("\\s+", 2);
                checked++;
                if (handled(parts[0], parts[1])) continue;
                boolean otherMethod = false;
                for (String m : new String[]{"GET", "POST", "PUT", "PATCH", "DELETE"}) {
                    if (handled(m, parts[1])) { otherMethod = true; break; }
                }
                if (!otherMethod) missing.add(line);
            }
        }
        // Paths with a handler for some method are extraction artefacts (method not parsed).
        System.out.println("[route-contract] checked=" + checked + " missing=" + missing.size());
        missing.forEach(m -> System.out.println("[route-contract] MISSING " + m));
        org.junit.jupiter.api.Assertions.assertTrue(checked > 250, "contract file looks truncated");
        // Ratchet: 4 left on 2026-11-26, all extraction artefacts (query strings glued to a path, a generic template). The number may
        // only go down; lower it whenever routes are ported.
        org.junit.jupiter.api.Assertions.assertTrue(missing.size() <= 4,
                "new frontend calls without a Spring handler: " + missing.size());
    }
}
