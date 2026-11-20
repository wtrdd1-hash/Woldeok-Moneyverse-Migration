package com.moneyverse.api.config;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class NativeCorsOriginValidationTest {
    @ParameterizedTest
    @CsvSource({
        "https://easy-scraping.com,https://easy-scraping.com",
        "https://test.easy-scraping.com/,https://test.easy-scraping.com",
        "https://test.easy-scraping.com:443,https://test.easy-scraping.com",
        "http://localhost:49979,http://localhost:49979",
        "http://127.0.0.1:49979/,http://127.0.0.1:49979",
        "http://[::1]:49979,http://[::1]:49979"
    })
    void configurationUsesAnExactCanonicalOrigin(String configured,String expected) {
        assertEquals(expected,SecurityConfig.configuredOrigin(configured));
    }
    @ParameterizedTest @NullAndEmptySource
    @ValueSource(strings={"https://USER:PASSWORD@HOST.invalid","https://example.invalid/path",
        "https://example.invalid?key=value","https://example.invalid#fragment",
        "http://test.easy-scraping.com","https://*.example.invalid","file:///tmp/a",
        "https://example.invalid:99999","not-an-origin"})
    void unsafeConfigurationCannotExpandCredentialedOrigins(String configured) {
        assertThrows(IllegalArgumentException.class,()->SecurityConfig.configuredOrigin(configured));
    }
}
