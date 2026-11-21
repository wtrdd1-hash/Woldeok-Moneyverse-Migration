package com.moneyverse.api.domain.health.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties="moneyverse.app-base-url=https://easy-scraping.com")
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import(com.moneyverse.api.testing.NativeBuildMetadataFixture.class)
@ActiveProfiles("test")
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private com.moneyverse.api.testing.NativeBuildMetadataFixture.MetadataResource metadata;

    @org.junit.jupiter.api.BeforeEach
    void packagedNativeBuild() {
        metadata.set("d".repeat(40),"spring-native");
    }

    @Test
    void schedulingRemainsEnabledByDefault() {
        org.junit.jupiter.api.Assertions.assertFalse(context.getBeansOfType(
            org.springframework.scheduling.annotation.ScheduledAnnotationBeanPostProcessor.class).isEmpty());
    }

    @Autowired private org.springframework.context.ApplicationContext context;

    @Test
    @DisplayName("GET /health 호출 시 200 OK와 서비스 상태를 정상 반환한다")
    void healthReturnsOk() throws Exception {
        mockMvc.perform(get("/health").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UP"))
                .andExpect(jsonPath("$.data.service").value("moneyverse-spring-backend"));
    }

    @Test
    @DisplayName("GET /api/version 호출 시 200 OK와 스프링 엔진 버전을 반환한다")
    void versionReturnsOk() throws Exception {
        mockMvc.perform(get("/api/version").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.version").value("native-"+"d".repeat(12)))
                .andExpect(jsonPath("$.id").value("d".repeat(40)))
                .andExpect(jsonPath("$.data.activeEngine").value("Java Spring Boot"));
    }

    @Autowired @org.springframework.beans.factory.annotation.Qualifier("corsConfigurationSource")
    private org.springframework.web.cors.CorsConfigurationSource corsSource;

    @Test void productionDoesNotGrantCredentialedCorsToTheTestOrigin() {
        var cors=corsSource.getCorsConfiguration(new org.springframework.mock.web.MockHttpServletRequest());
        org.junit.jupiter.api.Assertions.assertNotNull(cors);
        org.junit.jupiter.api.Assertions.assertNull(cors.checkOrigin("https://test.easy-scraping.com"));
        org.junit.jupiter.api.Assertions.assertEquals("https://easy-scraping.com",cors.checkOrigin("https://easy-scraping.com"));
    }
}
