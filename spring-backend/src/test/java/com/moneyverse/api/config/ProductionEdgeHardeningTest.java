package com.moneyverse.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/**
 * Production must not publish its API description, and must not grant credentialed CORS to
 * developer origins. Both are reachable only on loopback today (the firewall drops 4550 from
 * outside), so this is defence in depth: a firewall change or a new edge route must not turn
 * either into an exposure. A localhost origin with credentials would let any page a member
 * happens to run on that port act with their session.
 */
@SpringBootTest(properties={"moneyverse.app-base-url=https://easy-scraping.com","moneyverse.scheduling.enabled=false"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductionEdgeHardeningTest {
    @Autowired MockMvc mvc;
    @Autowired @Qualifier("corsConfigurationSource") CorsConfigurationSource source;

    @Test void apiDescriptionIsNotPublishedByDefault() throws Exception {
        int docs=mvc.perform(get("/v3/api-docs")).andReturn().getResponse().getStatus();
        int ui=mvc.perform(get("/swagger-ui/index.html")).andReturn().getResponse().getStatus();
        assertNotEquals(200,docs,"API description must be disabled unless explicitly enabled");
        assertNotEquals(200,ui,"Swagger UI must be disabled unless explicitly enabled");
    }

    @Test void productionCorsRejectsDeveloperOrigins() {
        var cors=source.getCorsConfiguration(new MockHttpServletRequest());
        assertNotNull(cors);
        assertEquals("https://easy-scraping.com",cors.checkOrigin("https://easy-scraping.com"));
        assertEquals("https://www.easy-scraping.com",cors.checkOrigin("https://www.easy-scraping.com"));
        for(String dev:new String[]{"http://localhost:3000","http://localhost:4501","http://127.0.0.1:4501",
                "http://127.0.0.1:4550","http://localhost:4550"}) {
            assertNull(cors.checkOrigin(dev),dev+" must not receive credentialed CORS in Production");
        }
    }
}
