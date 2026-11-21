package com.moneyverse.frontendpresentation;

import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.*;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import static org.junit.jupiter.api.Assertions.*;

/** Real source and browser HTTP distinguish composition from a cosmetic route proxy. */
class UnifiedFrontendIsolationTest {
    static HttpServer upstream;static ServletWebServerApplicationContext application;static URI base;
    static final HttpClient browser=HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
    static final List<String> sourcePaths=new CopyOnWriteArrayList<>();
    static final String COOKIE="__Host-mv_session=qa-unified";
    static final Map<String,String> bodies=new HashMap<>();
    @BeforeAll static void start() throws Exception {
        upstream=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        upstream.createContext("/",exchange->{
            String path=exchange.getRequestURI().getPath();sourcePaths.add(path);
            boolean signed=COOKIE.equals(exchange.getRequestHeaders().getFirst("Cookie"));
            String body=bodies.getOrDefault(path,switch(path){
                case "/api/v1/admin/me" -> "{\"roles\":[\"superadmin\",\"approver\"]}";
                case "/api/v1/admin/users" -> "{\"users\":[]}";
                case "/api/v1/admin/stocks" -> "{\"stocks\":[]}";
                case "/api/v1/admin/controls" -> "{\"featureSwitches\":[]}";
                case "/api/v1/business/catalog" -> "{\"success\":true,\"catalog\":[]}";
                case "/api/v1/admin/discord-outbox-events" -> "{\"events\":[]}";
                default -> "{}";
            });
            byte[] bytes=body.getBytes(StandardCharsets.UTF_8);exchange.getResponseHeaders().set("Content-Type","application/json");
            exchange.sendResponseHeaders(signed?200:401,bytes.length);exchange.getResponseBody().write(bytes);exchange.close();
        });upstream.start();
        Class<?> config;try{config=Class.forName("com.moneyverse.frontendpresentation.UnifiedFrontendApplication");}catch(ClassNotFoundException absent){return;}
        application=(ServletWebServerApplicationContext)new SpringApplicationBuilder(config).properties("server.port=0","server.address=127.0.0.1",
            "moneyverse.admin.source-origin=http://127.0.0.1:"+upstream.getAddress().getPort(),"spring.main.banner-mode=off").run("--server.port=0","--server.address=127.0.0.1");
        base=URI.create("http://127.0.0.1:"+application.getWebServer().getPort());
    }
    @AfterAll static void stop(){if(application!=null)application.close();if(upstream!=null)upstream.stop(0);}
    @BeforeEach void reset(){sourcePaths.clear();bodies.clear();}
    static HttpResponse<String> get(String path,String cookie) throws Exception {
        assertNotNull(application,"The explicit unified frontend is missing");
        var request=HttpRequest.newBuilder(base.resolve(path));if(cookie!=null)request.header("Cookie",cookie);
        return browser.send(request.GET().build(),HttpResponse.BodyHandlers.ofString());
    }
    @Test void onlyPresentationComponentsAreImported(){
        assertNotNull(application,"The explicit unified frontend is missing");
        for(String name:List.of("dataSource","jdbcTemplate","entityManagerFactory","userAuthService","adminAuthService","marketTickerService","discordBotService","socketIOServer","nativePublicFeaturePageController"))
            assertFalse(application.containsBean(name),name);
        assertFalse(application.containsBean("org.springframework.context.annotation.internalScheduledAnnotationProcessor"));
    }
    @Test void acceptedPublicPagesShareTheSameRealFaviconAndNov18Shell() throws Exception {
        for(String path:List.of("/","/index.html","/tools","/calculators","/tools/compound-calculator","/tools/stock-calculator")){
            var response=get(path,null);assertEquals(200,response.statusCode(),path);assertTrue(response.body().contains("favicon.ico?v="),path);
            assertTrue(response.body().contains("#0C1020"),path);
        }
        assertTrue(sourcePaths.isEmpty(),"Public HTML must not acquire backend credentials or private data");
    }
    @Test void existingAdministratorReadsUseTheSameProcessWithoutRemovingTheirSources() throws Exception {
        for(String path:List.of("/admin","/admin/","/admin/users","/admin/market","/admin/controls","/admin/enterprises","/admin/logs/delivery")){
            var response=get(path,COOKIE);assertEquals(200,response.statusCode(),path);assertTrue(response.body().contains("class=\"admin-sidebar\""));
            assertTrue(response.headers().firstValue("Cache-Control").orElse("").contains("no-store"));
        }
        assertTrue(sourcePaths.contains("/api/v1/admin/discord-outbox-events"));
    }
    @Test void missingOrForgedAdministratorIdentityNeverReadsPrivateRows() throws Exception {
        assertEquals(302,get("/admin/users",null).statusCode());assertTrue(sourcePaths.isEmpty());
        bodies.put("/api/v1/admin/me","{\"roles\":[\"member\"]}");assertEquals(403,get("/admin/users",COOKIE).statusCode());
        assertEquals(List.of("/api/v1/admin/me"),sourcePaths);
    }
    @Test void incompleteFeatureCandidatesAndMutationsAreNotActivatedByComposition() throws Exception {
        for(String path:List.of("/stocks","/shop","/board","/account","/api/v1/admin/users","/actuator/env"))assertEquals(403,get(path,COOKIE).statusCode(),path);
        var request=HttpRequest.newBuilder(base.resolve("/admin/users")).header("Cookie",COOKIE).POST(HttpRequest.BodyPublishers.ofString("{}")).build();
        assertEquals(403,browser.send(request,HttpResponse.BodyHandlers.discarding()).statusCode());assertTrue(sourcePaths.isEmpty());
    }
    @Test void isolatedFrontendHealthCannotClaimDatabaseOrWholeSiteAcceptance() throws Exception {
        var response=get("/frontend-ui-health",null);assertEquals(200,response.statusCode());
        assertTrue(response.body().contains("\"databaseRequired\":false"));assertTrue(response.body().contains("\"wholeSiteAccepted\":false"));
        var properties=new java.util.Properties();try(var resource=UnifiedFrontendIsolationTest.class.getResourceAsStream("/META-INF/build-info.properties")){if(resource!=null)properties.load(resource);}
        String packaged=properties.getProperty("build.sourceRevision","");var version=get("/frontend-ui-version",null);
        boolean verified=packaged.matches("[0-9a-f]{40}");assertEquals(verified?200:503,version.statusCode());
        if(verified)assertTrue(version.body().contains("\"id\":\""+packaged+"\""));
    }

    static String memberProof(){return "{\"signedIn\":true,\"authenticated\":true,\"id\":\"00000000-0000-4000-8000-000000000001\",\"userId\":\"00000000-0000-4000-8000-000000000001\",\"balanceWld\":99999999999999999999999999999999999999,\"user\":{\"id\":\"00000000-0000-4000-8000-000000000001\",\"userId\":\"00000000-0000-4000-8000-000000000001\"}}";}
    @Test void userPagesVerifyTheRealCookieBeforeRenderingOwnerBoundClients() throws Exception {
        bodies.put("/api/v1/auth/me",memberProof());
        for(String route:List.of("/wallet","/support","/chat")){
            sourcePaths.clear();var response=get(route,COOKIE);assertEquals(200,response.statusCode(),route);
            assertEquals(List.of("/api/v1/auth/me"),sourcePaths);assertTrue(response.body().contains("class=\"app-shell\""));
            assertTrue(response.body().contains("/assets/mv39/favicon.ico?v="));assertTrue(response.body().contains("no-store")||response.headers().firstValue("Cache-Control").orElse("").contains("no-store"));
            assertTrue(response.headers().firstValue("X-Robots-Tag").orElse("").contains("noindex"));
            assertFalse(response.body().contains("99999999999999999999999999999999999999"));assertFalse(response.body().contains("00000000-0000-4000-8000-000000000001"));
            assertTrue(response.headers().allValues("Set-Cookie").isEmpty());
        }
    }
    @Test void memberAliasesRequireTheSameVerifiedProofAndDoNotCreateAnAccountFallback() throws Exception {
        bodies.put("/api/v1/auth/me",memberProof());
        for(String route:List.of("/wallet/","/wallet.html","/wallet/index.html","/support/","/support.html","/support/index.html","/chat/","/chat.html","/chat/index.html"))
            assertEquals(200,get(route,COOKIE).statusCode(),route);
        assertEquals(403,get("/account",COOKIE).statusCode());
    }
    @Test void absentAmbiguousOrFalseMemberProofDoesNotReadAnyPrivateRows() throws Exception {
        for(String route:List.of("/wallet","/support","/chat")){
            sourcePaths.clear();assertEquals(302,get(route,null).statusCode());assertTrue(sourcePaths.isEmpty());
            assertEquals(302,get(route,COOKIE+"; __Host-mv_session=second").statusCode());assertTrue(sourcePaths.isEmpty());
            bodies.put("/api/v1/auth/me","{\"authenticated\":false,\"signedIn\":false,\"user\":null}");
            assertEquals(302,get(route,COOKIE).statusCode());
        }
    }
    @Test void malformedConflictingOrUnknownMemberProofFailsClosedWithoutPrivateOutput() throws Exception {
        for(String body:List.of("{}",memberProof().replace("\"signedIn\":true","\"signedIn\":false"),
            memberProof().replace("\"id\":\"00000000-0000-4000-8000-000000000001\"","\"id\":\"not-a-uuid\""),
            memberProof().replace("\"userId\":\"00000000-0000-4000-8000-000000000001\"","\"userId\":\"00000000-0000-4000-8000-000000000002\""))){
            bodies.put("/api/v1/auth/me",body);var response=get("/support",COOKIE);assertEquals(503,response.statusCode());
            assertTrue(response.body().contains("Unable to load data"));assertFalse(response.body().contains("id=\"new-thread-form\""));
        }
    }
    @Test void flightMemberRequestsAndPostsCannotReachPrivateMutationHandlers() throws Exception {
        bodies.put("/api/v1/auth/me",memberProof());assertEquals(406,get("/support?_rsc=invalid",COOKIE).statusCode());
        var request=HttpRequest.newBuilder(base.resolve("/support")).header("Cookie",COOKIE).POST(HttpRequest.BodyPublishers.ofString("body=not-sent")).build();
        sourcePaths.clear();assertEquals(403,browser.send(request,HttpResponse.BodyHandlers.discarding()).statusCode());assertTrue(sourcePaths.isEmpty());
    }


    @Test void memberPagesRetainFiveLanguagePrivateHeadersAndExplicitEncodedMappings() throws Exception {
        bodies.put("/api/v1/auth/me",memberProof());
        for(String lang:List.of("en","ko","ja","zh","vi")){
            var response=get("/support",COOKIE+"; wdmv_locale="+lang);assertEquals(200,response.statusCode());
            assertEquals(lang,response.headers().firstValue("Content-Language").orElse(""));
            assertTrue(response.body().contains("lang=\""+lang+"\""));
        }
        for(String path:List.of("/w%61llet","/s%75pport","/ch%61t"))assertEquals(200,get(path,COOKIE).statusCode(),path);
    }


    @Test void existingNativeAuthenticationScreensCanShareTheRendererWithoutIssuingSessions() throws Exception {
        for(String path:List.of("/login","/login/providers","/register","/forgot-password","/reset-password","/verify-email","/verify-email-change","/account-deletion")){
            var response=get(path,null);assertEquals(200,response.statusCode(),path);assertTrue(response.body().contains("/assets/mv43/auth.js?v="));
            assertTrue(response.headers().allValues("Set-Cookie").isEmpty());assertTrue(response.headers().firstValue("X-Robots-Tag").orElse("").contains("noindex"));
        }
        assertTrue(sourcePaths.isEmpty(),"Rendering the existing auth forms must not call an identity or mutation endpoint");
    }
    @Test void administratorDiagnosticsMeasureActualValidatedReadsInsteadOfInventedHealthMetrics() throws Exception {
        var response=get("/admin/api-health",COOKIE);assertEquals(200,response.statusCode());
        assertTrue(response.body().contains("class=\"admin-sidebar\""));
        for(String key:List.of("users","stocks","controls","catalog"))assertTrue(response.body().contains("data-probe-key=\""+key+"\" data-probe-state=\"read\""),key);
        assertEquals(List.of("/api/v1/admin/me","/api/v1/admin/users","/api/v1/admin/stocks","/api/v1/admin/controls","/api/v1/business/catalog"),sourcePaths);
        assertFalse(response.body().contains("OPERATIONAL"));assertFalse(response.body().contains("globalSuccessRate"));assertFalse(response.body().contains("ROUTE_METRICS"));
        assertTrue(response.body().contains("data-i18n=\"adminProbeScope\""));assertTrue(response.body().contains("data-probe-duration="));
    }
    @Test void malformedProbeEvidenceIsUnavailableNotAHealthyZeroOrGlobalFailureClaim() throws Exception {
        bodies.put("/api/v1/admin/stocks","{\"stocks\":\"wrong-shape\",\"secretFixture\":\"not-rendered\"}");
        var response=get("/admin/api-health",COOKIE);assertEquals(200,response.statusCode());
        assertTrue(response.body().contains("data-probe-key=\"stocks\" data-probe-state=\"unavailable\""));
        assertTrue(response.body().contains("data-probe-key=\"users\" data-probe-state=\"read\""));
        assertFalse(response.body().contains("not-rendered"));assertTrue(response.body().contains("data-i18n=\"adminProbePartial\""));
    }
    @Test void diagnosticReadsStayPrivateAndKeepTheRequiredAdministratorBoundary() throws Exception {
        assertEquals(302,get("/admin/api-health",null).statusCode());assertTrue(sourcePaths.isEmpty());
        bodies.put("/api/v1/admin/me","{\"roles\":[\"member\"]}");assertEquals(403,get("/admin/api-health",COOKIE).statusCode());
        assertEquals(List.of("/api/v1/admin/me"),sourcePaths);
    }

}
