package com.moneyverse.api.domain.health;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;
import java.util.Properties;
import java.util.regex.Pattern;

/** Use a fixed classpath resource because Spring's build-info location is runtime configurable. */
@Component
public final class NativeBuildIdentity {
    private static final Pattern SHA=Pattern.compile("[a-f0-9]{40}");
    private final Resource metadata;

    public NativeBuildIdentity(@Value("classpath:META-INF/build-info.properties") Resource metadata) {
        this.metadata=metadata;
    }

    public Optional<String> sourceSha() {
        var packaged=new Properties();
        try(var stream=metadata.getInputStream()) {
            packaged.load(stream);
            if(!"spring-native".equals(packaged.getProperty("build.runtimeKind"))) return Optional.empty();
            String revision=packaged.getProperty("build.sourceRevision");
            return revision!=null && SHA.matcher(revision).matches()?Optional.of(revision):Optional.empty();
        } catch(IOException|IllegalArgumentException unavailable) {
            return Optional.empty();
        }
    }
}
