package com.moneyverse.api.domain.health.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"BUILD_ID=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","moneyverse.scheduling.enabled=false"})
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import(com.moneyverse.api.testing.NativeBuildMetadataFixture.class)
@ActiveProfiles("test")
class NativeBuildIdentityHttpTest {
    static final String PACKAGED_SHA="a".repeat(40);
    @Autowired MockMvc mvc;
    @Autowired com.moneyverse.api.testing.NativeBuildMetadataFixture.MetadataResource metadata;

    @BeforeEach void packagedNativeMetadata() {
        metadata.set(PACKAGED_SHA,"spring-native");
    }

    @Test void apiAndFrontendAttestTheSamePackagedSourceInsteadOfRuntimeOverrides() throws Exception {
        for(String path:new String[]{"/api/version","/frontend-version"}) {
            mvc.perform(get(path)).andExpect(status().isOk())
                .andExpect(header().string("Cache-Control","private, no-store"))
                .andExpect(header().string("X-MV-Source-SHA",PACKAGED_SHA))
                .andExpect(header().doesNotExist("Set-Cookie"))
                .andExpect(jsonPath("$.id").value(PACKAGED_SHA))
                .andExpect(jsonPath("$.runtime").value("Spring-MVC-Thymeleaf"))
                .andExpect(jsonPath("$.data.applicationSourceSha").value(PACKAGED_SHA))
                .andExpect(jsonPath("$.scope").value("native-frontend-and-owned-api"));
        }
    }

    @Test void missingSourceMetadataCannotCertifyARelease() throws Exception {
        metadata.set(null,"spring-native");
        assertUnavailable();
    }

    @ParameterizedTest
    @ValueSource(strings={"","unverified","aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n"})
    void malformedSourceMetadataCannotCertifyARelease(String revision) throws Exception {
        metadata.set(revision,"spring-native");
        assertUnavailable();
    }

    @Test void anotherRuntimeKindCannotImpersonateTheNativeFrontend() throws Exception {
        metadata.set(PACKAGED_SHA,"legacy-node");
        assertUnavailable();
    }

    private void assertUnavailable() throws Exception {
        for(String path:new String[]{"/api/version","/frontend-version"}) {
            mvc.perform(get(path)).andExpect(status().isServiceUnavailable())
                .andExpect(header().string("Cache-Control","private, no-store"))
                .andExpect(header().doesNotExist("X-MV-Source-SHA"))
                .andExpect(jsonPath("$.ok").value(false))
                .andExpect(jsonPath("$.code").value("BUILD_IDENTITY_UNAVAILABLE"))
                .andExpect(jsonPath("$.id").doesNotExist());
        }
    }
}
