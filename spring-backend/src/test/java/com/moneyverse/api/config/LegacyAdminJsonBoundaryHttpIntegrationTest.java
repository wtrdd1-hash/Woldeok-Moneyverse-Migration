package com.moneyverse.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LegacyAdminJsonBoundaryHttpIntegrationTest {
    @Autowired MockMvc mvc;

    @Test void directLegacyAdminJsonUrlsRequireCurrentDatabaseAuthorizedSession() throws Exception {
        for (String url:new String[]{
                "/admin/ai-news/settings", "/admin/ai-news/templates",
                "/admin/api-health/status", "/admin/audit/dispositions",
                "/admin/audit/retention", "/admin/blog-verified",
                "/admin/blog/articles", "/admin/fx/status", "/admin/help/articles",
                "/admin/safety/chat-reports", "/admin/safety/takedowns",
                "/admin/storage/headroom", "/admin/discord-outbox-events"}) {
            mvc.perform(get(url)).andExpect(status().isUnauthorized())
                .andExpect(header().string("Cache-Control", "no-store"));
        }
    }

    @Test void spoofedUserAndInternalHeadersNeverAuthorizeLegacyAdminApis() throws Exception {
        mvc.perform(get("/admin/ai-news/settings")
                .header("X-User-Id","00000000-0000-0000-0000-000000000101")
                .header("x-internal-token","not-a-session"))
                .andExpect(status().isUnauthorized());
    }

    @Test void staticAdministratorBrowserPagesRetainSafeLoginRedirect() throws Exception {
        for (String url:new String[]{"/admin/analytics.html","/admin/market","/admin/users"}) {
            mvc.perform(get(url)).andExpect(status().isFound());
        }
    }
}
