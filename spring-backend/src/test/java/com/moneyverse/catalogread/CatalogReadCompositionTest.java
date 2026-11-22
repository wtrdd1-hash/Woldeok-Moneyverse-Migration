package com.moneyverse.catalogread;

import com.zaxxer.hikari.HikariDataSource;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.net.*;
import java.net.http.*;
import java.util.*;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.env.SystemEnvironmentPropertySource;
import static org.junit.jupiter.api.Assertions.*;

/** Real pool configuration must be bound before its first connection seals Hikari. */
class CatalogReadCompositionTest {
    @Test void realDataSourceCompositionStartsWithoutAnEntityManagerOrDatabaseInitializer() throws Exception {
        verifyComposition(false,false);
    }
    @Test void deployedReadOnlyEnvironmentBindsBeforePoolStartup() throws Exception {
        verifyComposition(true,false);
    }
    @Test void canonicalReadOnlyPropertiesBindBeforePoolStartup() throws Exception {
        verifyComposition(false,true);
    }
    private Map<String,Object> generatedPoolEnvironment() throws Exception {
        Path helper=Path.of("..","ops","nov18-catalog-read-canary","canary.py").toAbsolutePath().normalize();
        String script="""
            import importlib.util,json,shlex,sys,uuid
            spec=importlib.util.spec_from_file_location('deployed_canary_fixture',sys.argv[1])
            module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
            raw='postgresql://moneyverse_app:ci_'+uuid.uuid4().hex+'@127.0.0.1/disposable'
            lines=module.database_environment(raw).splitlines()
            print(json.dumps({k:shlex.split(v)[0] for k,v in (line.split('=',1) for line in lines) if k.startswith('SPRING_DATASOURCE_HIKARI_')}))
            """;
        Process process=new ProcessBuilder("python3","-c",script,helper.toString()).redirectErrorStream(true).start();
        try {
            assertTrue(process.waitFor(20,TimeUnit.SECONDS),"The deployment configuration fixture must finish");
            byte[] output=process.getInputStream().readNBytes(4097);
            assertEquals(0,process.exitValue(),"The deployment configuration fixture must be valid");
            assertTrue(output.length<=4096,"The deployment configuration fixture must be bounded");
            return new ObjectMapper().readValue(new String(output,StandardCharsets.UTF_8),new TypeReference<Map<String,Object>>(){});
        }finally{if(process.isAlive())process.destroyForcibly();}
    }
    private void verifyComposition(boolean deployedEnvironment,boolean canonicalProperties) throws Exception {
        ServletWebServerApplicationContext context=null;
        try {
            var environment=new StandardEnvironment();
            if(deployedEnvironment)environment.getPropertySources().replace(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,
                new SystemEnvironmentPropertySource(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,generatedPoolEnvironment()));
            var arguments=new ArrayList<String>(List.of("--server.address=127.0.0.1","--server.port=0","--spring.main.banner-mode=off",
                "--spring.datasource.url=jdbc:h2:mem:catalog_composition_"+UUID.randomUUID()+";MODE=PostgreSQL",
                "--spring.datasource.username=sa","--spring.datasource.password=","--spring.datasource.driver-class-name=org.h2.Driver"));
            if(canonicalProperties)arguments.addAll(List.of("--spring.datasource.hikari.read-only=true","--spring.datasource.hikari.maximum-pool-size=2",
                "--spring.datasource.hikari.minimum-idle=0","--spring.datasource.hikari.connection-timeout=5000"));
            context=(ServletWebServerApplicationContext)new SpringApplicationBuilder(CatalogReadApplication.class)
                .environment(environment).run(arguments.toArray(String[]::new));
            assertNotNull(context.getBean(DataSource.class));
            assertNotNull(context.getBean(org.springframework.transaction.PlatformTransactionManager.class));
            if(deployedEnvironment||canonicalProperties){
                var pool=(HikariDataSource)context.getBean(DataSource.class);
                assertTrue(pool.isReadOnly());assertEquals(2,pool.getMaximumPoolSize());
                assertEquals(0,pool.getMinimumIdle());assertEquals(5000,pool.getConnectionTimeout());
            }
            for(String name:new String[]{"entityManagerFactory","dataSourceScriptDatabaseInitializer","userAuthService","marketTickerService","socketIOServer"})
                assertFalse(context.containsBean(name),name);
            URI health=URI.create("http://127.0.0.1:"+context.getWebServer().getPort()+"/catalog-read-health");
            var response=HttpClient.newHttpClient().send(HttpRequest.newBuilder(health).GET().build(),HttpResponse.BodyHandlers.ofString());
            assertEquals(503,response.statusCode(),"An arbitrary datasource cannot become a trusted canonical backend");
            assertFalse(response.body().contains("org.h2"));
        }finally{if(context!=null)context.close();}
    }
}
