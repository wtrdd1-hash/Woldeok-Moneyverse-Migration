package com.moneyverse.api.domain.shop;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Verifies the exact endpoint used by Next guest shop, not the older /catalog alias. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ShopPublicCatalogContractTest {
    @Autowired MockMvc mockMvc;

    @Test void publicCatalogMustRouteToCanonicalSourceRatherThan404Fallback() throws Exception {
        // H2 does not have the real PostgreSQL SECURITY DEFINER function.
        // A correctly mapped controller returns 503 (no source), never HTML200 or 404.
        mockMvc.perform(get("/api/v1/shop/public-catalog"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test void malformedUpkeepAndTooLongSearchMustReturn400NotFakeEmpty() throws Exception {
        mockMvc.perform(get("/api/v1/shop/public-catalog?maxUpkeep=-1"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/shop/public-catalog?maxUpkeep=001"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/shop/catalog?q=" + "a".repeat(81)))
                .andExpect(status().isBadRequest());
    }

    @Test void publicCatalogV1AliasMustAlsoFailClosedInsteadOfMissingRoute() throws Exception {
        mockMvc.perform(get("/api/shop/public-catalog"))
                .andExpect(status().isServiceUnavailable());
    }
}
