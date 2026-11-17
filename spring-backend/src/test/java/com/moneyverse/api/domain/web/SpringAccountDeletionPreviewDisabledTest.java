package com.moneyverse.api.domain.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "moneyverse.web.account-deletion-preview-enabled=false")
@ActiveProfiles("test")
@AutoConfigureMockMvc
class SpringAccountDeletionPreviewDisabledTest {
    @Autowired org.springframework.context.ApplicationContext context;
    @Autowired MockMvc mvc;

    @Test
    void disabledPreviewReturnsExplicit404InsteadOfLegacySpaIndex() throws Exception {
        assertFalse(context.containsBean("springAccountDeletionController"));
        assertTrue(context.containsBean("springAccountDeletionPreviewDisabledController"));
        mvc.perform(get("/spring-web/account-deletion"))
                .andExpect(status().isNotFound())
                .andExpect(header().string("Cache-Control", "private, no-store"))
                .andExpect(header().string("X-Robots-Tag", "noindex, nofollow"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"));
    }
}
