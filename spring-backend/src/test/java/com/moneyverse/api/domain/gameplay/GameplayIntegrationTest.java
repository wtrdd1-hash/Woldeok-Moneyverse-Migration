package com.moneyverse.api.domain.gameplay;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.work.dto.WorkDtos.WorkAssignRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GameplayIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Work owner reads and task assignments reject anonymous callers")
    void testWorkDomainEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/work"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/work/tasks"))
                .andExpect(status().isUnauthorized());
        WorkAssignRequest request = new WorkAssignRequest("11111111-1111-1111-1111-111111111111");
        mockMvc.perform(post("/api/v1/work/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Business H2 catalogue fails closed; private holdings reject anonymous caller")
    void testBusinessDomainEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/business/catalog"))
                .andExpect(status().isServiceUnavailable());
        mockMvc.perform(get("/api/v1/business/my"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Shop 도메인 카탈로그, 인벤토리 및 제작 레시피 API 통합 검증")
    void testShopDomainEndpoints() throws Exception {
        // H2 has no canonical PostgreSQL shop read function; never return demo items as real.
        mockMvc.perform(get("/api/v1/shop/catalog"))
                .andExpect(status().isServiceUnavailable());

        // Private inventory belongs to a verified server-side session, not an arbitrary header.
        mockMvc.perform(get("/api/v1/shop/inventory"))
                .andExpect(status().isUnauthorized());

        // Crafting must not advertise fabricated recipe data without a source.
        mockMvc.perform(get("/api/v1/shop/crafting/recipes"))
                .andExpect(status().isServiceUnavailable());
    }
}
