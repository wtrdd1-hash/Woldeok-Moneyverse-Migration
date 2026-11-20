package com.moneyverse.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties={"moneyverse.app-base-url=https://test.easy-scraping.com","moneyverse.scheduling.enabled=false"})
@ActiveProfiles("test")
class NativeTestOriginCorsTest {
    @Autowired @Qualifier("corsConfigurationSource") CorsConfigurationSource source;
    @Test void isolatedTestAcceptsItsConfiguredHttpsOrigin() {
        var cors=source.getCorsConfiguration(new MockHttpServletRequest());
        assertNotNull(cors);
        assertEquals("https://test.easy-scraping.com",cors.checkOrigin("https://test.easy-scraping.com"));
    }
    @Test void isolatedTestDoesNotBorrowProductionCredentialedCorsAuthority() {
        var cors=source.getCorsConfiguration(new MockHttpServletRequest());
        assertNotNull(cors);
        assertNull(cors.checkOrigin("https://easy-scraping.com"));
    }
}
