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
    @Test
    void immutableFrontendReleasePrecedesLegacyForStaticAssets() {
        String base="/srv/moneyverse-data/releases/web-v2026.11.18.24-sample/frontend-static";
        String[] roots=SpaWebMvcConfig.resourceLocations(base);
        assertEquals("file:"+base+"/",roots[0]);
        assertEquals("file:/srv/moneyverse-data/frontend-static/",roots[1]);
        assertEquals("classpath:/static/",roots[2]);
    }

    @Test
    void versionedReleaseCannotHijackUnknownLegacyPages() {
        String release="/srv/moneyverse-data/releases/frontend-v2026.11.18.24-test/frontend-static";
        assertFalse(SpaWebMvcConfig.allowSpaFallback("file:"+release+"/",release));
        assertTrue(SpaWebMvcConfig.allowSpaFallback("file:/srv/moneyverse-data/frontend-static/",release));
        assertTrue(SpaWebMvcConfig.allowSpaFallback("classpath:/static/",release));
    }

    @Test
    void unconfiguredServiceKeepsCurrentAssetsAndUnknownChunksNeverBecome200Html() {
        assertEquals(2,SpaWebMvcConfig.resourceLocations("").length);
        assertTrue(SpaWebMvcConfig.isStaticFile("_next/static/chunks/missing.js"));
        assertTrue(SpaWebMvcConfig.isStaticFile("images/logo.png"));
        assertFalse(SpaWebMvcConfig.isStaticFile("tools/compound-calculator"));
        assertThrows(IllegalArgumentException.class,()->SpaWebMvcConfig.resourceLocations("/etc/ssh"));
    }
}
