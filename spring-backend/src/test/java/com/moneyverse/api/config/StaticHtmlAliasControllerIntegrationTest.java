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
class StaticHtmlAliasControllerIntegrationTest {
    @Autowired MockMvc mvc;
    @Test void collectionIndexHtmlNoLongerCollidesWithPutId() throws Exception {
        mvc.perform(get("/collections/index.html"))
            .andExpect(status().is3xxRedirection())
            .andExpect(redirectedUrl("/collections/"));
    }
    @Test void stockAlertsIndexHtmlNoLongerCollidesWithDeleteId() throws Exception {
        mvc.perform(get("/stocks/alerts/index.html"))
            .andExpect(status().is3xxRedirection())
            .andExpect(redirectedUrl("/stocks/alerts/"));
    }
}
