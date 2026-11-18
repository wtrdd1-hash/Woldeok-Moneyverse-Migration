package com.moneyverse.api.config;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SpaFallbackExclusionTest {
    @Test
    void androidApiMustNeverReturnSuccessfulSpaHtml() {
        assertTrue(SpaWebMvcConfig.isBackendRoute("app-api/v1/auth/viewer"));
        assertTrue(SpaWebMvcConfig.isBackendRoute("/app-api/v1/shop/catalog"));
        assertTrue(SpaWebMvcConfig.isBackendRoute("api/v1/wallet"));
        assertFalse(SpaWebMvcConfig.isBackendRoute("admin"));
        assertFalse(SpaWebMvcConfig.isBackendRoute("assets/site.css"));
    }
}
