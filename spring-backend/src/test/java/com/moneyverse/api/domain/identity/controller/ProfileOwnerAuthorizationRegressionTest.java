package com.moneyverse.api.domain.identity.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProfileOwnerAuthorizationRegressionTest {
    @Autowired MockMvc mockMvc;

    @Test void anonymousCannotReadPrivateProfile() throws Exception {
        mockMvc.perform(get("/api/v1/profile/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test void forgedUserHeaderCannotReadPrivateProfile() throws Exception {
        mockMvc.perform(get("/api/v1/profile")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000777"))
                .andExpect(status().isUnauthorized());
    }

    @Test void forgedUserHeaderCannotReadPrivateSettings() throws Exception {
        mockMvc.perform(get("/api/v1/profile/settings")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000777"))
                .andExpect(status().isUnauthorized());
    }

    @Test void forgedHeaderCannotModifyAnotherProfile() throws Exception {
        mockMvc.perform(put("/api/v1/profile")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000777")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"displayName\":\"bogus\"}"))
                .andExpect(status().isUnauthorized());
    }
}
