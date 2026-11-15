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
    @DisplayName("Work 도메인 대시보드 및 과업 수락 API 통합 검증")
    void testWorkDomainEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/work"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.summary").exists())
                .andExpect(jsonPath("$.tasks").isArray());

        mockMvc.perform(get("/api/v1/work/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.tasks").isArray());

        WorkAssignRequest assignReq = new WorkAssignRequest("11111111-1111-1111-1111-111111111111");
        mockMvc.perform(post("/api/v1/work/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.assignment_id").exists());
    }

    @Test
    @DisplayName("Business 도메인 카탈로그 및 보유 사업장 API 통합 검증")
    void testBusinessDomainEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/business/catalog"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.catalog").isArray());

        mockMvc.perform(get("/api/v1/business/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.businesses").isArray());
    }

    @Test
    @DisplayName("Shop 도메인 카탈로그, 인벤토리 및 제작 레시피 API 통합 검증")
    void testShopDomainEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/shop/catalog"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.items").isArray());

        mockMvc.perform(get("/api/v1/shop/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.inventory").isArray());

        mockMvc.perform(get("/api/v1/shop/crafting/recipes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.recipes").isArray());
    }
}
