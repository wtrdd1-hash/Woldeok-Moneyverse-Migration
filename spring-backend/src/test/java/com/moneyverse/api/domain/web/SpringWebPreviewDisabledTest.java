package com.moneyverse.api.domain.web;

import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "moneyverse.web.preview-enabled=false")
@ActiveProfiles("test")
@AutoConfigureMockMvc
class SpringWebPreviewDisabledTest {
    @Autowired MockMvc mvc;
    @Autowired ApplicationContext applicationContext;

    @Test
    void templateRoutesDoNotReplaceProductionWhenFlagIsOff() throws Exception {
        org.junit.jupiter.api.Assertions.assertFalse(applicationContext.containsBean("springWebController"));
        mvc.perform(get("/spring-web")).andExpect(status().isNotFound());
        mvc.perform(get("/spring-web/status")).andExpect(status().isNotFound());
    }
}
