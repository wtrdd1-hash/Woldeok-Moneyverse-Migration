package com.moneyverse.api.testing;

import com.moneyverse.api.domain.health.NativeBuildIdentity;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.AbstractResource;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

@TestConfiguration(proxyBeanMethods=false)
public class NativeBuildMetadataFixture {
    @Bean public MetadataResource nativeMetadataFixtureResource() {return new MetadataResource();}
    @Bean @Primary public NativeBuildIdentity fixtureNativeIdentity(MetadataResource resource) {
        return new NativeBuildIdentity(resource);
    }

    public static final class MetadataResource extends AbstractResource {
        private byte[] bytes=new byte[0];
        public void set(String revision,String kind) {
            var properties=new Properties();
            if(revision!=null)properties.setProperty("build.sourceRevision",revision);
            if(kind!=null)properties.setProperty("build.runtimeKind",kind);
            var output=new ByteArrayOutputStream();
            try {properties.store(output,null);} catch(IOException impossible) {throw new AssertionError(impossible);}
            bytes=output.toByteArray();
        }
        @Override public String getDescription() {return "Packaged native build metadata fixture";}
        @Override public InputStream getInputStream() {return new ByteArrayInputStream(bytes);}
    }
}
