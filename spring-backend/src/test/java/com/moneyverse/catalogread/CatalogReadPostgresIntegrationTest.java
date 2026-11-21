package com.moneyverse.catalogread;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import java.net.*;
import java.net.http.*;
import java.sql.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import org.springframework.core.env.MapPropertySource;
import static org.junit.jupiter.api.Assertions.*;

/** Committed synthetic fixtures are visible to independent HTTP transactions only in disposable CI. */
@Tag("postgres-shop")
class CatalogReadPostgresIntegrationTest {
    static Connection fixture;
    static ServletWebServerApplicationContext app;
    static URI origin;
    static UUID actor=UUID.randomUUID(),member=UUID.randomUUID(),item=UUID.randomUUID();
    static String adminSession=UUID.randomUUID().toString(),memberSession=UUID.randomUUID().toString(),expiredSession=UUID.randomUUID().toString();
    static final HttpClient http=HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
    static final ObjectMapper json=new ObjectMapper();
    @BeforeAll static void setup() throws Exception {
        assertEquals("true",System.getenv("GITHUB_ACTIONS"),"Only disposable GitHub PostgreSQL may contain these fixtures");
        String url=System.getenv("MONEYVERSE_MESSAGING_PG_TEST_URL");assertNotNull(url);assertTrue(url.startsWith("jdbc:postgresql://"));
        URI target=URI.create(url.substring(5));assertTrue(Set.of("127.0.0.1","localhost").contains(target.getHost()));
        assertEquals("/woldeok_moneyverse_dev",target.getPath());assertNull(target.getUserInfo());assertNull(target.getQuery());assertNull(target.getFragment());
        String user=System.getenv("MONEYVERSE_MESSAGING_PG_TEST_USER"),password=System.getenv("MONEYVERSE_MESSAGING_PG_TEST_PASSWORD");
        assertNotNull(user);assertNotNull(password);
        fixture=DriverManager.getConnection(url,user,password);fixture.setAutoCommit(false);
        execute("INSERT INTO public.users(id) VALUES (?::uuid),(?::uuid)",actor,member);
        execute("INSERT INTO public.user_roles(user_id,role) VALUES (?::uuid,'superadmin')",actor);
        execute("INSERT INTO public.shop_catalog(id,code,name,description,category,base_price,effect_kind,purchase_limit) SELECT ?::uuid,?::text,'Synthetic catalog QA','Disposable source fixture',category,9007199254740993,effect_kind,purchase_limit FROM public.shop_catalog ORDER BY code LIMIT 1",item,"qa_"+item.toString().replace("-",""));
        assertEquals(1,count("SELECT count(*) FROM public.shop_catalog WHERE id=?::uuid",item));
        for(var row:List.of(List.of(actor,adminSession,"1 hour"),List.of(member,memberSession,"1 hour"),List.of(actor,expiredSession,"-1 hour")))
            execute("INSERT INTO public.auth_sessions(token_hash,csrf_hash,user_id,expires_at) VALUES (?::text,'ci_read_fixture',?::uuid,clock_timestamp()+?::interval)",UserAuthService.sha256((String)row.get(1)),row.get(0),row.get(2));
        // Migration216 extends every new member session; expire only this synthetic row after the insert trigger runs.
        execute("UPDATE public.auth_sessions SET expires_at=clock_timestamp()-interval '1 hour' WHERE token_hash=?::text",UserAuthService.sha256(expiredSession));
        assertEquals(1,count("SELECT count(*) FROM public.auth_sessions WHERE token_hash=?::text AND expires_at<clock_timestamp()",UserAuthService.sha256(expiredSession)));
        fixture.commit();
        Map<String,Object> properties=new HashMap<>();
        properties.put("spring.datasource.url",url);properties.put("spring.datasource.username",user);properties.put("spring.datasource.password",password);
        properties.put("spring.datasource.driver-class-name","org.postgresql.Driver");
        properties.put("spring.datasource.hikari.connection-init-sql","SET ROLE moneyverse_app");
        properties.put("spring.datasource.hikari.maximum-pool-size","2");properties.put("spring.main.banner-mode","off");
        app=(ServletWebServerApplicationContext)new SpringApplicationBuilder(CatalogReadApplication.class)
            .initializers(context->context.getEnvironment().getPropertySources().addFirst(new MapPropertySource("disposable-catalog-fixture",properties)))
            .run("--server.address=127.0.0.1","--server.port=0");
        origin=URI.create("http://127.0.0.1:"+app.getWebServer().getPort());
    }
    static void execute(String sql,Object... values) throws Exception {
        try(var statement=fixture.prepareStatement(sql)){for(int i=0;i<values.length;i++)statement.setObject(i+1,values[i]);statement.executeUpdate();}
    }
    static long count(String sql,Object value) throws Exception {
        try(var statement=fixture.prepareStatement(sql)){statement.setObject(1,value);try(var row=statement.executeQuery()){assertTrue(row.next());return row.getLong(1);}}
    }
    @AfterAll static void cleanup() throws Exception {
        if(app!=null)app.close();
        if(fixture!=null)try {
            fixture.rollback();
            execute("DELETE FROM public.auth_sessions WHERE user_id IN (?::uuid,?::uuid)",actor,member);
            execute("DELETE FROM public.user_roles WHERE user_id=?::uuid",actor);
            execute("DELETE FROM public.shop_catalog WHERE id=?::uuid",item);
            execute("DELETE FROM public.users WHERE id IN (?::uuid,?::uuid)",actor,member);
            fixture.commit();
        }finally{fixture.close();}
    }
    static HttpResponse<String> get(String path,String token,String... headers) throws Exception {
        var request=HttpRequest.newBuilder(origin.resolve(path));
        if(token!=null)request.header("Cookie","__Host-mv_session="+token);
        for(int i=0;i<headers.length;i+=2)request.header(headers[i],headers[i+1]);
        return http.send(request.GET().build(),HttpResponse.BodyHandlers.ofString());
    }
    @Test void actualSessionRoleFunctionAndReadOnlyConnectionReturnTheExactCatalog() throws Exception {
        var response=get("/api/v1/admin/shop/items",adminSession);
        assertEquals(200,response.statusCode());assertEquals(actor.toString(),response.headers().firstValue("X-MV-Owner").orElse(""));
        var rows=json.readTree(response.body()).path("items");assertTrue(rows.isArray());
        var found=false;
        for(var row:rows)if(item.toString().equals(row.path("id").asText())){
            assertTrue(row.path("base_price").isTextual());assertEquals("9007199254740993",row.path("base_price").textValue());found=true;
        }
        assertTrue(found);
        assertEquals(200,get("/catalog-read-health",null).statusCode());
    }
    @Test void realMemberExpiredSessionAndForgedActorAreRefused() throws Exception {
        for(var sample:Map.of("ordinary-member",memberSession,"expired-session",expiredSession).entrySet()) {
            var response=get("/api/v1/admin/shop/items",sample.getValue());
            String code;
            try{var body=json.readTree(response.body());code=body==null?"empty":body.path("code").asText("absent");}
            catch(Exception malformed){code="non-json";}
            assertEquals(401,response.statusCode(),sample.getKey()+" refusal code="+code);
        }
        assertEquals(401,get("/api/v1/admin/shop/items",null,"X-User-Id",actor.toString()).statusCode());
    }
    @Test void commandsCannotWriteAndReadsNeverUpdateExistingSessions() throws Exception {
        long sessions=count("SELECT count(*) FROM public.auth_sessions WHERE user_id=?::uuid",actor);
        for(String method:List.of("POST","PATCH","DELETE")) {
            var request=HttpRequest.newBuilder(origin.resolve("/api/v1/admin/shop/items")).header("Cookie","__Host-mv_session="+adminSession)
                .method(method,HttpRequest.BodyPublishers.ofString("{}")).build();
            assertEquals(403,http.send(request,HttpResponse.BodyHandlers.ofString()).statusCode());
        }
        assertEquals(200,get("/api/v1/admin/shop/items",adminSession).statusCode());
        assertEquals(sessions,count("SELECT count(*) FROM public.auth_sessions WHERE user_id=?::uuid",actor));
        assertEquals(9007199254740993L,count("SELECT base_price FROM public.shop_catalog WHERE id=?::uuid",item));
    }
    @Test void currentDatabaseRoleRevocationTakesEffectOnTheNextRead() throws Exception {
        execute("DELETE FROM public.user_roles WHERE user_id=?::uuid",actor);fixture.commit();
        try{assertEquals(401,get("/api/v1/admin/shop/items",adminSession).statusCode());}
        finally{execute("INSERT INTO public.user_roles(user_id,role) VALUES (?::uuid,'superadmin')",actor);fixture.commit();}
    }
}
