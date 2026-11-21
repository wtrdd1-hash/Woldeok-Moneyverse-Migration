package com.moneyverse.api.domain.shop;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ShopActorIsolationRegressionTest {
    @Autowired MockMvc mockMvc;

    @Test
    void forgedUserHeaderWithoutVerifiedSessionCannotReadPrivateInventory() throws Exception {
        mockMvc.perform(get("/api/v1/shop/inventory")
                .header("X-User-Id", "00000000-0000-0000-0000-000000000123"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void forgedUserHeaderWithoutVerifiedSessionCannotPurchase() throws Exception {
        mockMvc.perform(post("/api/v1/shop/purchase")
                .header("X-User-Id", "00000000-0000-0000-0000-000000000123")
                .contentType("application/json")
                .content("{\"item_id\":\"00000000-0000-0000-0000-000000000456\",\"quantity\":1}"))
                .andExpect(status().isUnauthorized());
    }
}
