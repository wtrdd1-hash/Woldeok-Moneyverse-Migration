package com.moneyverse.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminHtmlBoundaryHttpIntegrationTest {
    @Autowired MockMvc mvc;

    @Test void anonymousAdministratorHtmlNeverRendersThroughSpringMvc() throws Exception {
        for(String path:new String[]{"/admin","/admin.html","/admin/","/admin/index.html",
                "/admin/market","/admin/users","/admin/analytics","/admin-preview","/admin-preview/index.html"}) {
            mvc.perform(get(path)).andExpect(status().isFound())
                    .andExpect(header().string("Location",org.hamcrest.Matchers.startsWith("/login?next=")))
                    .andExpect(header().string("Cache-Control","private, no-store"))
                    .andExpect(header().string("X-Frame-Options","DENY"));
        }
    }

    @Test void publicMemberHomeRemainsServedAndAdminApisStillRequireAuthentication() throws Exception {
        mvc.perform(get("/")) .andExpect(status().isOk());
        mvc.perform(get("/assets/mv39/i18n.js")) .andExpect(status().isOk());
        mvc.perform(get("/assets/mv40/admin.css")) .andExpect(status().isOk());
        mvc.perform(get("/api/v1/admin/users")).andExpect(status().isUnauthorized());
    }
}
