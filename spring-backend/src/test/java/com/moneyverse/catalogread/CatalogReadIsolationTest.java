package com.moneyverse.catalogread;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.health.NativeBuildIdentity;
import java.net.*;
import java.net.http.*;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.*;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.SimpleTransactionStatus;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CatalogReadIsolationTest {
    static ServletWebServerApplicationContext app;
    static URI origin;
    static final String ACTOR="12345678-1234-4234-8234-123456789abc", COOKIE="qa-read-session";
    static final List<String> sql=new CopyOnWriteArrayList<>();
    static final List<Boolean> readOnly=new CopyOnWriteArrayList<>();
    static volatile boolean denied,unavailable,wrongPrincipal;
    static final HttpClient http=HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
    @TestConfiguration static class Fixture {
        @Bean @Primary NativeBuildIdentity responseFixtureIdentity(){
            // This HTTP boundary fixture does not certify the actual packaged release artifact.
            return new NativeBuildIdentity(new ByteArrayResource(("build.runtimeKind=spring-native\n"
                +"build.sourceRevision="+"a".repeat(40)+"\n").getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        }
        @Bean JdbcTemplate jdbcTemplate(){
            JdbcTemplate jdbc=mock(JdbcTemplate.class);
            when(jdbc.queryForObject(anyString(),eq(String.class))).thenAnswer(call->{
                String query=call.getArgument(0);sql.add(query);
                if(unavailable)throw new IllegalStateException("Fixture source unavailable");
                if(query.equals("SELECT current_user"))return wrongPrincipal?"postgres":"moneyverse_app";
                if(query.equals("SHOW transaction_read_only"))return "on";
                throw new AssertionError("Unlisted source query");
            });
            when(jdbc.queryForObject(anyString(),eq(String.class),any(Object[].class))).thenAnswer(call->{
                String query=call.getArgument(0);sql.add(query);
                if(unavailable)throw new IllegalStateException("Fixture source unavailable");
                if(query.contains("FROM auth_sessions") && UserAuthService.sha256(COOKIE).equals(call.getArgument(2)))return ACTOR;
                throw new org.springframework.dao.EmptyResultDataAccessException(1);
            });
            doAnswer(call->{
                String query=call.getArgument(0);sql.add(query);
                if(unavailable)throw new IllegalStateException("Fixture source unavailable");
                if(query.contains("public.admin_current_roles"))return denied?List.of():List.of("superadmin");
                if(query.contains("public.admin_shop_items"))return List.of(Map.of("id",ACTOR,"code","QA","name","Fixture item","category","title","base_price","9007199254740993"));
                throw new AssertionError("Unlisted source query");
            }).when(jdbc).query(anyString(),any(RowMapper.class),any(Object[].class));
            return jdbc;
        }
        @Bean PlatformTransactionManager transactionManager(){
            PlatformTransactionManager manager=mock(PlatformTransactionManager.class);
            when(manager.getTransaction(any())).thenAnswer(call->{readOnly.add(((TransactionDefinition)call.getArgument(0)).isReadOnly());return new SimpleTransactionStatus();});
            return manager;
        }
    }
    @BeforeAll static void start() throws Exception {
        Class<?> runtime;
        try{runtime=Class.forName("com.moneyverse.catalogread.CatalogReadApplication");}
        catch(ClassNotFoundException missing){fail("The isolated canonical catalog runtime is missing");return;}
        app=(ServletWebServerApplicationContext)new SpringApplicationBuilder(runtime,Fixture.class)
            .properties("spring.main.banner-mode=off","spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
            .run("--server.address=127.0.0.1","--server.port=0");
        origin=URI.create("http://127.0.0.1:"+app.getWebServer().getPort());
    }
    @BeforeEach void reset(){sql.clear();readOnly.clear();denied=false;unavailable=false;wrongPrincipal=false;}
    @AfterAll static void close(){if(app!=null)app.close();}
    static HttpResponse<String> get(String path,String... headers) throws Exception {
        var request=HttpRequest.newBuilder(origin.resolve(path));
        for(int i=0;i<headers.length;i+=2)request.header(headers[i],headers[i+1]);
        return http.send(request.GET().build(),HttpResponse.BodyHandlers.ofString());
    }
    @Test void verifiedExistingSessionReadsCanonicalExactPriceInReadOnlyTransactions() throws Exception {
        var response=get("/api/v1/admin/shop/items","Cookie","__Host-mv_session="+COOKIE);
        assertEquals(200,response.statusCode());assertEquals(ACTOR,response.headers().firstValue("X-MV-Owner").orElse(""));
        assertTrue(response.body().contains("\"base_price\":\"9007199254740993\""));
        assertTrue(response.headers().firstValue("Cache-Control").orElse("").contains("no-store"));
        assertFalse(readOnly.isEmpty());assertTrue(readOnly.stream().allMatch(Boolean::booleanValue));
        assertTrue(sql.stream().anyMatch(query->query.contains("public.admin_shop_items")));
    }
    @Test void forgedActorAndAbsentOrRolelessSessionCannotRead() throws Exception {
        assertEquals(401,get("/api/v1/admin/shop/items","X-User-Id",ACTOR).statusCode());
        denied=true;assertEquals(401,get("/api/v1/admin/shop/items","Cookie","__Host-mv_session="+COOKIE).statusCode());
    }
    @Test void sourceFailureOrWrongDatabasePrincipalNeverReturnsItems() throws Exception {
        unavailable=true;var failed=get("/api/v1/admin/shop/items","Cookie","__Host-mv_session="+COOKIE);
        assertEquals(503,failed.statusCode());assertFalse(failed.body().contains("Fixture item"));
        unavailable=false;wrongPrincipal=true;assertEquals(503,get("/api/v1/admin/shop/items","Cookie","__Host-mv_session="+COOKIE).statusCode());
    }
    @Test void allSiblingApisDocumentsAndCommandsAreClosedBeforeDatabaseReads() throws Exception {
        for(String path:List.of("/","/admin/shop","/api/v1/admin/me","/api/v1/wallet","/api/v1/admin/shop/anything"))
            assertEquals(403,get(path).statusCode(),path);
        for(String method:List.of("POST","PATCH","DELETE")) {
            var request=HttpRequest.newBuilder(origin.resolve("/api/v1/admin/shop/items")).method(method,HttpRequest.BodyPublishers.ofString("{}")).build();
            assertEquals(403,http.send(request,HttpResponse.BodyHandlers.ofString()).statusCode());
        }
        assertTrue(sql.isEmpty());assertTrue(readOnly.isEmpty());
    }
    private static void privateResponse(HttpResponse<String> response,int status){
        assertEquals(status,response.statusCode());
        assertEquals("noindex, nofollow, noarchive",response.headers().firstValue("X-Robots-Tag").orElse(""));
    }
    @Test void everyPrivateReadAndRefusalResponseExcludesIndexing() throws Exception {
        privateResponse(get("/api/v1/admin/shop/items","Cookie","__Host-mv_session="+COOKIE),200);
        privateResponse(get("/api/v1/admin/shop/items"),401);
        denied=true;
        privateResponse(get("/api/v1/admin/shop/items","Cookie","__Host-mv_session="+COOKIE),401);
        denied=false;unavailable=true;
        privateResponse(get("/api/v1/admin/shop/items","Cookie","__Host-mv_session="+COOKIE),503);
        privateResponse(get("/catalog-read-health"),503);
        unavailable=false;
        privateResponse(get("/catalog-read-version"),200);
        privateResponse(get("/api/v1/admin/me"),403);
        var post=HttpRequest.newBuilder(origin.resolve("/api/v1/admin/shop/items"))
            .POST(HttpRequest.BodyPublishers.ofString("{}")).build();
        privateResponse(http.send(post,HttpResponse.BodyHandlers.ofString()),403);
        var head=HttpRequest.newBuilder(origin.resolve("/api/v1/admin/shop/items"))
            .header("Cookie","__Host-mv_session="+COOKIE).method("HEAD",HttpRequest.BodyPublishers.noBody()).build();
        privateResponse(http.send(head,HttpResponse.BodyHandlers.ofString()),200);
    }
    @Test void readRuntimeContainsNoSessionIssuerEconomicJobsSocketOrPresentationBeans(){
        for(String name:List.of("userAuthService","socketIOServer","marketTickerService","economyService","frontendSecurity","adminShopController","statusTruthService"))
            assertFalse(app.containsBean(name),name);
    }
}
