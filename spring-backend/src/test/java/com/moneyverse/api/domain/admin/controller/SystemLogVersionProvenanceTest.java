package com.moneyverse.api.domain.admin.controller;

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
class SystemLogVersionProvenanceTest {
    @Autowired MockMvc mvc;
    @Test
    void sourceIdentityIsExposedAtTopLevelWithoutRemovingTheExistingVersionEnvelope() throws Exception {
        mvc.perform(get("/api/version"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.data.activeEngine").value("Java Spring Boot"));
    }
}
