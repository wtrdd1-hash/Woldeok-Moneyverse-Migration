package com.moneyverse.presentation;

import com.moneyverse.api.domain.health.NativeBuildIdentity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes=NativePresentationApplication.class,webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,properties={
    "spring.datasource.url=not-a-database","spring.datasource.username=unused","server.address=127.0.0.1"})
@AutoConfigureMockMvc
class NativePresentationIsolationTest {
    @Autowired ApplicationContext context;
    @Autowired MockMvc mvc;
    @LocalServerPort int port;
    @Autowired NativeBuildIdentity identity;
    @Test void frontendRuntimeDoesNotCreateAnyDatabaseConnection() {
        for(String name:new String[]{"dataSource","jdbcTemplate","entityManagerFactory","userAuthService",
            "socketIOServer","discordBotService","marketTickerService",
            "org.springframework.context.annotation.internalScheduledAnnotationProcessor"})
            assertFalse(context.containsBean(name),"Presentation must exclude backend bean: "+name);
    }
    @ParameterizedTest @ValueSource(strings={"/","/index.html","/tools","/calculators",
        "/tools/compound-calculator","/tools/stock-calculator","/stocks","/shop","/board"})
    void existingPublicPagesRenderWithoutAnyDatabase(String path) throws Exception {
        String html=mvc.perform(get(path).header("Accept-Language","ko")).andExpect(status().isOk())
            .andExpect(header().string("Content-Language","ko"))
            .andExpect(header().string("X-MV-Renderer","Spring-MVC-Thymeleaf"))
            .andExpect(header().doesNotExist("Set-Cookie"))
            .andReturn().getResponse().getContentAsString();
        if(java.util.List.of("/stocks","/shop","/board").contains(path)) {
            assertTrue(html.contains("data-page=\""+path.substring(1)+"\""),"The source-backed renderer must select the requested feature");
            assertFalse(html.contains("12,580"));
            assertFalse(html.contains("+2.41%"));
        }
        var logos=java.util.regex.Pattern.compile("<img\\b[^>]*class=\"brand-mark\"[^>]*>").matcher(html)
            .results().map(java.util.regex.MatchResult::group).toList();
        assertEquals(2,logos.size(),"Desktop and mobile brand links must show the actual favicon");
        for(String logo:logos) for(String attribute:new String[]{"src=\"/assets/mv39/favicon.ico?v=9ce0a8f10cafff52d1d2f7aa451b3e9162944162f61258842e13aa8546f98e78\"",
            "alt=\"\"","width=\"32\"","height=\"32\""})
            assertTrue(logo.contains(attribute),"Logo must preserve accessible fixed-size favicon markup: "+attribute);
        var icons=java.util.regex.Pattern.compile("<link[^>]*rel=\"icon\"[^>]*>").matcher(html)
            .results().map(java.util.regex.MatchResult::group).toList();
        assertEquals(1,icons.size(),"Tab branding must declare exactly one favicon");
        assertTrue(icons.get(0).contains("href=\"/assets/mv39/favicon.ico?v=9ce0a8f10cafff52d1d2f7aa451b3e9162944162f61258842e13aa8546f98e78\""));
    }
    @ParameterizedTest @ValueSource(strings={"/api/version","/api/v1/auth/local/login",
        "/api/treasury/overview","/wallet","/admin","/socket.io/","/login","/actuator/health"})
    void backendAndMemberRoutesAreNotExposed(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isForbidden()).andExpect(header().doesNotExist("Set-Cookie"));
    }
    @ParameterizedTest @ValueSource(strings={"/","/tools","/tools/compound-calculator","/api/v1/auth/local/login"})
    void mutatingMethodsAreDeniedWithoutCreatingSessions(String path) throws Exception {
        mvc.perform(post(path).contentType("application/json").content("{}"))
            .andExpect(status().isForbidden()).andExpect(header().doesNotExist("Set-Cookie"));
    }
    @Test void assetsComeOnlyFromThePackagedClasspath() throws Exception {
        var expected=new ClassPathResource("static/assets/mv39/i18n.js").getContentAsByteArray();
        mvc.perform(get("/assets/mv39/i18n.js")).andExpect(status().isOk()).andExpect(content().bytes(expected));
        assertNotEquals(200,mvc.perform(get("/assets/mv39/missing.js")).andReturn().getResponse().getStatus());
        mvc.perform(get("/assets/mv39/favicon.ico?v=9ce0a8f10cafff52d1d2f7aa451b3e9162944162f61258842e13aa8546f98e78")).andExpect(status().isOk())
            .andExpect(header().doesNotExist("Set-Cookie"))
            .andExpect(content().bytes(new ClassPathResource("static/assets/mv39/favicon.ico").getContentAsByteArray()));
    }
    @Test void queryValidationAndFlightNegativesRemainActive() throws Exception {
        mvc.perform(get("/tools").param("category","unsupported")).andExpect(status().isBadRequest());
        mvc.perform(get("/").header("RSC","1")).andExpect(status().isNotAcceptable());
        mvc.perform(get("/tools/compound-calculator").param("years","invalid")).andExpect(status().isBadRequest());
    }
    @Test void frontendIdentityDoesNotClaimABackendRelease() throws Exception {
        var result=mvc.perform(get("/frontend-version"))
            .andExpect(header().string("Cache-Control","private, no-store"))
            .andExpect(jsonPath("$.scope").value("public-presentation-only")).andReturn();
        assertEquals(identity.sourceSha().isPresent()?200:503,result.getResponse().getStatus());
    }
    @Test void readinessExplicitlyHasNoDatabaseDependency() throws Exception {
        mvc.perform(get("/presentation-health")).andExpect(status().isOk())
            .andExpect(jsonPath("$.databaseRequired").value(false));
    }
    @ParameterizedTest @ValueSource(strings={"/wallet","/login","/api/version"})
    void deniedHtmlRequestsCannotCreateHttpSessions(String path) throws Exception {
        mvc.perform(get(path).header("Accept","text/html")).andExpect(status().isForbidden())
            .andExpect(result->assertNull(result.getRequest().getSession(false),
                "A presentation-only request must not create an HTTP session"));
    }
    @Test void actualContainerDoesNotIssueSessionCookiesForDeniedHtml() throws Exception {
        {
            var client=HttpClient.newHttpClient();
            for(String path:new String[]{"/wallet","/login","/api/version"}) {
                var response=client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:"+port+path))
                    .header("Accept","text/html").GET().build(),HttpResponse.BodyHandlers.discarding());
                assertEquals(403,response.statusCode());
                assertTrue(response.headers().allValues("Set-Cookie").isEmpty(),"Public renderer must not issue session cookies");
            }
        }
    }
}
