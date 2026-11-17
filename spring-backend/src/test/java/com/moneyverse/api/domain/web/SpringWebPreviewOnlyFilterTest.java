package com.moneyverse.api.domain.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"moneyverse.web.preview-restricted=true",
        "moneyverse.web.preview-enabled=true", "moneyverse.web.account-deletion-preview-enabled=true"})
@ActiveProfiles("test")
@AutoConfigureMockMvc
class SpringWebPreviewOnlyFilterTest {
    @Autowired MockMvc mvc;

    @Test
    void onlyReadOnlySpringWebPreviewCanBeServed() throws Exception {
        mvc.perform(get("/spring-web?lang=ko"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("월덕 머니버스")));
        mvc.perform(get("/spring-web/account-deletion?lang=en"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Account deletion request")));
        mvc.perform(get("/assets/spring-web-site.css")).andExpect(status().isOk());
    }

    @Test
    void deniesAllProductionApiMemberAdminMoneyAndMutations() throws Exception {
        for (String path : new String[]{"/", "/api/version", "/api/v1/admin/me",
                "/api/v1/wallet", "/api/v1/stocks", "/account", "/actuator/health",
                "/_next/static/fake.js", "/admin", "/spring-web/../../api/version"}) {
            mvc.perform(get(path)).andExpect(status().isNotFound())
                    .andExpect(header().string("Cache-Control", "private, no-store"))
                    .andExpect(header().string("X-Robots-Tag", "noindex, nofollow"));
        }
        mvc.perform(post("/spring-web/account-deletion")).andExpect(status().isNotFound());
        mvc.perform(post("/api/v1/treasury/transfer")).andExpect(status().isNotFound());
    }
}
