package com.moneyverse.frontendpresentation;

import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.*;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import static org.junit.jupiter.api.Assertions.*;

/** Actual source/renderer HTTP verifies this public page never borrows a visitor identity. */
class NativeStatusIsolationTest {
    static HttpServer source;
    static ServletWebServerApplicationContext app;
    static URI origin;
    static final HttpClient client=HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
    static final List<Map<String,List<String>>> headers=new CopyOnWriteArrayList<>();
    static volatile int status=200;
    static volatile String body;
    @BeforeAll static void start() throws Exception {
        source=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        source.createContext("/",exchange->{
            headers.add(new TreeMap<>(exchange.getRequestHeaders()));
            assertEquals("/api/v1/status",exchange.getRequestURI().getPath());assertEquals("GET",exchange.getRequestMethod());
            exchange.getResponseHeaders().set("Content-Type","application/json");
            byte[] bytes=body.getBytes(StandardCharsets.UTF_8);exchange.sendResponseHeaders(status,bytes.length);exchange.getResponseBody().write(bytes);exchange.close();
        });source.start();
        app=(ServletWebServerApplicationContext)new SpringApplicationBuilder(UnifiedFrontendApplication.class)
            .properties("moneyverse.public.source-origin=http://127.0.0.1:"+source.getAddress().getPort(),"spring.main.banner-mode=off")
            .run("--server.port=0","--server.address=127.0.0.1");
        origin=URI.create("http://127.0.0.1:"+app.getWebServer().getPort());
    }
    @BeforeEach void reset(){headers.clear();status=200;body="{\"status\":[{\"sourceKey\":\"qa-public\",\"displayName\":\"<script>unsafe()</script>\",\"state\":\"operational\",\"detail\":null,\"observedAt\":\""+Instant.now().minusSeconds(2)+"\",\"freshnessState\":\"fresh\",\"ageMs\":2000,\"policyVersion\":\"status-v1\"}]}";}
    @AfterAll static void stop(){if(app!=null)app.close();if(source!=null)source.stop(0);}
    static HttpResponse<String> get(String path,String language,String... extra) throws Exception {
        var request=HttpRequest.newBuilder(origin.resolve(path)).header("Accept-Language",language);
        for(int i=0;i<extra.length;i+=2)request.header(extra[i],extra[i+1]);
        return client.send(request.GET().build(),HttpResponse.BodyHandlers.ofString());
    }
    @Test void publicAliasesRenderActualSourceInTheCommonShellForFiveLocales() throws Exception {
        for(String path:List.of("/status","/status/","/status.html","/status/index.html"))for(String lang:List.of("en","ko","ja","zh","vi")){
            var response=get(path,lang);assertEquals(200,response.statusCode(),path+" "+lang);
            assertTrue(response.body().contains("qa-public"));assertTrue(response.body().contains("&lt;script&gt;unsafe()&lt;/script&gt;"));
            assertFalse(response.body().contains("<script>unsafe()"));assertTrue(response.body().contains("class=\"topbar\""));
            assertTrue(response.body().contains("id=\"mv-support-launcher\""));assertEquals(lang,response.headers().firstValue("Content-Language").orElse(""));
            assertTrue(response.headers().firstValue("Cache-Control").orElse("").contains("no-store"));
        }
        for(String bean:List.of("dataSource","jdbcTemplate","userAuthService","adminAuthService","socketIOServer","marketTickerService"))assertFalse(app.containsBean(bean),bean);
    }
    @Test void publicReadNeverForwardsVisitorCredentialsOrIdentityHeaders() throws Exception {
        assertEquals(200,get("/status","en","Cookie","__Host-mv_session=qa-private","Authorization","Bearer qa-transport","X-User-Id","qa-actor","X-Internal-Token","qa-internal").statusCode());
        assertEquals(1,headers.size());for(String name:List.of("Cookie","Authorization","X-User-Id","X-Internal-Token"))assertFalse(headers.get(0).containsKey(name),name);
    }
    @Test void missingSourceMalformedDataOrContradictoryFreshnessCannotAppearHealthy() throws Exception {
        status=503;var response=get("/status","en");assertEquals(503,response.statusCode());assertFalse(response.body().contains("state-operational"));
        status=200;body="{\"status\":\"unverified\"}";assertEquals(503,get("/status","en").statusCode());
        reset();body=body.replace("\"freshnessState\":\"fresh\"","\"freshnessState\":\"stale\"");assertEquals(503,get("/status","en").statusCode());
        reset();body=body.replace("qa-public","duplicate");body=body.replace("]}",","+body.substring(body.indexOf("[{" )+1,body.length()-2)+"]}");
        assertEquals(503,get("/status","en").statusCode());
    }
    @Test void futureObservationCannotBeAcceptedAsCurrentHealth() throws Exception {
        body=body.replaceFirst("\\\"observedAt\\\":\\\"[^\\\"]+\\\"","\"observedAt\":\""+Instant.now().plusSeconds(60)+"\"");
        var response=get("/status","en");assertEquals(503,response.statusCode());assertFalse(response.body().contains("state-operational"));
    }
    @Test void rscAndCommandsAreRefusedWithoutPublicSourceReads() throws Exception {
        assertEquals(406,get("/status","en","RSC","1").statusCode());assertEquals(406,get("/status?_rsc=qa","en").statusCode());assertTrue(headers.isEmpty());
        var post=HttpRequest.newBuilder(origin.resolve("/status")).POST(HttpRequest.BodyPublishers.ofString("qa-body")).build();
        assertEquals(403,client.send(post,HttpResponse.BodyHandlers.ofString()).statusCode());
        assertEquals(403,get("/api/v1/status","en").statusCode());
    }
    @Test void publicClientRejectsUnlistedReadsAndRemoteOrCredentialedOrigins(){
        var mapper=new com.fasterxml.jackson.databind.ObjectMapper();
        for(String configured:List.of("https://127.0.0.1:80","http://example.com:80","http://127.0.0.1:80/private","http://actor:qa@127.0.0.1:80","http://127.0.0.1:80?qa=1","http://127.0.0.1:80#qa"))
            assertThrows(IllegalArgumentException.class,()->new PublicSourceClient(configured,mapper));
        var fixed=new PublicSourceClient("http://127.0.0.1:"+source.getAddress().getPort(),mapper);
        for(String path:List.of("/api/v1/admin/me","/api/v1/status?url=http://example.com","//example.com/api/v1/status","/api/v1/status/../admin/me"))
            assertThrows(IllegalArgumentException.class,()->fixed.read(path));
        assertTrue(headers.isEmpty());
    }
    @Test void explicitPublicLocaleRetainsCookieQueryHeaderPrecedenceAcrossAliases() throws Exception {
        for(String path:List.of("/status","/status/","/status.html","/status/index.html")) {
            var query=get(path+"?lang=ja","en");assertEquals(200,query.statusCode());
            assertEquals("ja",query.headers().firstValue("Content-Language").orElse(""));
            assertTrue(query.body().contains("lang=ja"));assertTrue(query.body().contains("lang=\"ja\""));
            var cookie=get(path+"?lang=ja","en","Cookie","wdmv_locale=vi");
            assertEquals("vi",cookie.headers().firstValue("Content-Language").orElse(""));
            var fallback=get(path+"?lang=unsupported","ko");
            assertEquals("ko",fallback.headers().firstValue("Content-Language").orElse(""));
        }
    }
    @Test void ancientObservationCannotClaimFreshWithZeroAge() throws Exception {
        body=body.replaceFirst("\\\"observedAt\\\":\\\"[^\\\"]+\\\"","\"observedAt\":\"2020-01-01T00:00:00Z\"").replace("\"ageMs\":2000","\"ageMs\":0");
        assertEquals(503,get("/status","en").statusCode());
    }
    @Test void trailingGarbageOrSecondRootCannotHideStatusEvidence() throws Exception {
        String valid=body;
        for(String tail:List.of(" garbage"," {\"status\":[{\"state\":\"outage\"}]}")) {
            body=valid+tail;assertEquals(503,get("/status","en").statusCode());
        }
    }
    @Test void duplicateJsonFieldsOrOversizedSourceCannotBecomeHealthy() throws Exception {
        body=body.replace("\"state\":\"operational\"","\"state\":\"outage\",\"state\":\"operational\"");
        assertEquals(503,get("/status","en").statusCode());
        body="{\"status\":[],\"padding\":\""+"x".repeat(2*1024*1024)+"\"}";
        assertEquals(503,get("/status","en").statusCode());
    }

}
