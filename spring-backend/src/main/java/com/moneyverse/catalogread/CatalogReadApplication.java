package com.moneyverse.catalogread;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.health.NativeBuildIdentity;
import com.moneyverse.api.domain.shop.service.AdminShopService;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.autoconfigure.sql.init.SqlInitializationAutoConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.StaticHeadersWriter;

/** A single canonical read authority reuses existing sessions without importing any issuer or worker. */
@Configuration(proxyBeanMethods=false)
@EnableAutoConfiguration(exclude={HibernateJpaAutoConfiguration.class,JpaRepositoriesAutoConfiguration.class,UserDetailsServiceAutoConfiguration.class,SqlInitializationAutoConfiguration.class})
@Import({AdminAuthService.class,AdminShopService.class,NativeBuildIdentity.class,CatalogReadController.class})
public class CatalogReadApplication {
    @Bean SecurityFilterChain catalogReadSecurity(HttpSecurity http) throws Exception {
        String[] paths={"/api/v1/admin/shop/items","/catalog-read-health","/catalog-read-version"};
        http.csrf(csrf->csrf.disable()).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .requestCache(c->c.disable())
            .headers(h->h.addHeaderWriter(new StaticHeadersWriter("X-Robots-Tag","noindex, nofollow, noarchive")))
            .authorizeHttpRequests(a->a.requestMatchers(HttpMethod.GET,paths).permitAll()
                .requestMatchers(HttpMethod.HEAD,paths).permitAll().anyRequest().denyAll())
            .exceptionHandling(e->e.authenticationEntryPoint((req,res,error)->res.setStatus(403))
                .accessDeniedHandler((req,res,error)->res.setStatus(403)));
        return http.build();
    }
}
