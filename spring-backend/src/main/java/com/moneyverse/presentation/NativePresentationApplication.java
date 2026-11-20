package com.moneyverse.presentation;

import com.moneyverse.api.domain.health.NativeBuildIdentity;
import com.moneyverse.api.domain.tools.SpringNativeCalculatorsController;
import com.moneyverse.api.domain.tools.SpringNativeToolHubController;
import com.moneyverse.api.domain.web.NativeHomeController;
import com.moneyverse.api.domain.web.UiLocale;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.JdbcTemplateAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Explicit imports keep the public renderer independent of backend components and secrets. */
@Configuration(proxyBeanMethods=false)
@EnableAutoConfiguration(exclude={DataSourceAutoConfiguration.class,JdbcTemplateAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class,UserDetailsServiceAutoConfiguration.class})
@Import({NativeHomeController.class,NativePublicFeaturePageController.class,SpringNativeToolHubController.class,SpringNativeCalculatorsController.class,
    UiLocale.class,NativeBuildIdentity.class,NativePresentationIdentityController.class})
public class NativePresentationApplication implements WebMvcConfigurer {
    private static final String[] PUBLIC_PATHS={"/","/index.html","/tools","/calculators","/stocks","/shop","/board",
        "/tools/compound-calculator","/tools/stock-calculator","/frontend-version","/presentation-health",
        "/assets/mv39/**","/assets/mv43/**"};

    @Bean SecurityFilterChain presentationSecurity(HttpSecurity http) throws Exception {
        http.csrf(csrf->csrf.disable())
            .sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .requestCache(cache->cache.disable())
            .authorizeHttpRequests(auth->auth
                .requestMatchers(HttpMethod.GET,PUBLIC_PATHS).permitAll()
                .requestMatchers(HttpMethod.HEAD,PUBLIC_PATHS).permitAll()
                .anyRequest().denyAll())
            .exceptionHandling(errors->errors
                .authenticationEntryPoint((request,response,error)->response.setStatus(403))
                .accessDeniedHandler((request,response,error)->response.setStatus(403)));
        return http.build();
    }

    @Override public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Never fall through to mutable legacy frontend files or exported member HTML.
        registry.addResourceHandler("/assets/mv39/**").addResourceLocations("classpath:/static/assets/mv39/");
        registry.addResourceHandler("/assets/mv43/**").addResourceLocations("classpath:/static/assets/mv43/");
    }
}
