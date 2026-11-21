package com.moneyverse.api.domain.shop;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.shop.service.AdminShopService;
import java.net.URI;
import java.sql.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;

/** Real function/role tests run only in the disposable CI service and roll back each fixture. */
@Tag("postgres-shop")
class AdminShopPostgresIntegrationTest {
    Connection connection;
    JdbcTemplate jdbc;
    AdminShopService shop;
    UUID actor,member,item;
    String category;
    @BeforeEach void disposableFixture() throws Exception {
        assertEquals("true",System.getenv("GITHUB_ACTIONS"),"Disposable GitHub CI is required");
        String url=System.getenv("MONEYVERSE_MESSAGING_PG_TEST_URL");assertNotNull(url);
        assertTrue(url.startsWith("jdbc:postgresql://"));URI uri=URI.create(url.substring(5));
        assertTrue(Set.of("127.0.0.1","localhost").contains(uri.getHost()));assertEquals("/woldeok_moneyverse_dev",uri.getPath());
        assertNull(uri.getUserInfo());assertNull(uri.getQuery());assertNull(uri.getFragment());
        String user=System.getenv("MONEYVERSE_MESSAGING_PG_TEST_USER"),password=System.getenv("MONEYVERSE_MESSAGING_PG_TEST_PASSWORD");
        assertNotNull(user);assertNotNull(password);
        connection=DriverManager.getConnection(url,user,password);connection.setAutoCommit(false);
        jdbc=new JdbcTemplate(new SingleConnectionDataSource(connection,true));
        actor=UUID.randomUUID();member=UUID.randomUUID();
        jdbc.update("INSERT INTO public.users(id) VALUES (?::uuid),(?::uuid)",actor,member);
        jdbc.update("INSERT INTO public.user_roles(user_id,role) VALUES (?::uuid,'superadmin')",actor);
        item=jdbc.queryForObject("SELECT id FROM public.shop_catalog ORDER BY code LIMIT 1",UUID.class);assertNotNull(item);
        category=jdbc.queryForObject("SELECT category FROM public.shop_catalog WHERE id=?::uuid",String.class,item);
        jdbc.update("UPDATE public.shop_catalog SET base_price=9007199254740993 WHERE id=?::uuid",item);
        jdbc.execute("SET LOCAL ROLE moneyverse_app");
        assertEquals("moneyverse_app",jdbc.queryForObject("SELECT current_user",String.class));
        shop=new AdminShopService(jdbc);
    }
    @AfterEach void rollbackFixture() throws Exception {if(connection!=null)try{connection.rollback();}finally{connection.close();}}
    @Test void actualFunctionPreservesTheExactPriceThroughJavaAndJson(){
        var rows=shop.list(actor,null);var row=rows.stream().filter(value->item.toString().equals(value.get("id"))).findFirst().orElseThrow();
        assertEquals("9007199254740993",row.get("base_price"));
        var json=new ObjectMapper().valueToTree(row).path("base_price");assertTrue(json.isTextual());assertEquals("9007199254740993",json.textValue());
    }
    @Test void actualCategoryFilterUsesOnlyReturnedCanonicalRows(){
        var rows=shop.list(actor,category.toUpperCase(Locale.ROOT));assertFalse(rows.isEmpty());
        assertTrue(rows.stream().allMatch(row->category.equals(row.get("category"))));
    }
    @Test void ordinaryMemberIsRefusedByTheDatabaseFunction(){
        var failure=assertThrows(ResponseStatusException.class,()->shop.list(member,null));assertEquals(403,failure.getStatusCode().value());
    }
    @Test void successfulReadDoesNotRequireAnyRawCatalogPrivilege(){
        assertFalse(shop.list(actor,null).isEmpty());
        for(String privilege:List.of("SELECT","INSERT","UPDATE","DELETE"))
            assertEquals(Boolean.FALSE,jdbc.queryForObject("SELECT has_table_privilege(current_user,'public.shop_catalog',?::text)",Boolean.class,privilege));
    }
    @Test void missingFunctionGrantRemainsUnavailableRatherThanRoleDeniedOrEmpty(){
        jdbc.execute("RESET ROLE");jdbc.execute("REVOKE EXECUTE ON FUNCTION public.admin_shop_items(uuid) FROM moneyverse_app");jdbc.execute("SET LOCAL ROLE moneyverse_app");
        var failure=assertThrows(ResponseStatusException.class,()->shop.list(actor,null));assertEquals(503,failure.getStatusCode().value());
    }
}
