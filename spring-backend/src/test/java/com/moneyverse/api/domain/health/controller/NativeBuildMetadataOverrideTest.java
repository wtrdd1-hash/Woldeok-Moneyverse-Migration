package com.moneyverse.api.domain.health.controller;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"moneyverse.app-base-url=https://easy-scraping.com","moneyverse.scheduling.enabled=false"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NativeBuildMetadataOverrideTest {
    static final String FORGED="f".repeat(40);
    static Path external;
    @Autowired MockMvc mvc;

    @DynamicPropertySource static void externalBuildInfoOverride(DynamicPropertyRegistry properties) throws Exception {
        external=Files.createTempFile("native-untrusted-build-info-",".properties");
        Files.writeString(external,"build.sourceRevision="+FORGED+"\nbuild.runtimeKind=spring-native\n");
        properties.add("spring.info.build.location",()->external.toUri().toString());
    }
    @AfterAll static void removeOwnedFixture() throws Exception {if(external!=null)Files.deleteIfExists(external);}

    @Test void releaseIdentityIgnoresExternalSpringBuildInfoLocations() throws Exception {
        var packaged=new Properties();
        try(var stream=new ClassPathResource("META-INF/build-info.properties").getInputStream()){packaged.load(stream);}
        String sha=packaged.getProperty("build.sourceRevision","");
        assertNotEquals(FORGED,sha);
        for(String path:new String[]{"/api/version","/frontend-version"}) {
            if(sha.matches("[a-f0-9]{40}")) {
                mvc.perform(get(path)).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(sha));
            } else {
                mvc.perform(get(path)).andExpect(status().isServiceUnavailable())
                    .andExpect(jsonPath("$.id").doesNotExist());
            }
        }
    }
}
