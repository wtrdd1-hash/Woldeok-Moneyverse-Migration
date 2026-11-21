package com.moneyverse.adminpresentation;

import com.moneyverse.api.domain.admin.web.AdminNavigation;
import com.moneyverse.api.domain.health.NativeBuildIdentity;
import com.moneyverse.api.domain.web.UiLocale;
import com.moneyverse.api.domain.web.UiPageRenderer;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.JdbcTemplateAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.*;

/** Keep backend credentials, jobs and economic writes outside the read-only administrator UI. */
@Configuration(proxyBeanMethods=false)
@EnableAutoConfiguration(exclude={DataSourceAutoConfiguration.class,JdbcTemplateAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class,UserDetailsServiceAutoConfiguration.class})
@Import({AdminSourceClient.class,AdminUiController.class,AdminReadPageController.class,AdminDeliveryPageController.class,UiLocale.class,UiPageRenderer.class,AdminNavigation.class,NativeBuildIdentity.class})
public class NativeAdminApplication implements WebMvcConfigurer {
    @Bean SecurityFilterChain adminUiSecurity(HttpSecurity http) throws Exception {
        String[] reads={"/admin","/admin/","/admin/logs/system","/admin/logs/delivery","/admin/users","/admin/market","/admin/controls",
            "/admin/enterprises","/admin/economy","/admin/economy/scenario-lab","/admin-ui-health","/admin-ui-version",
            "/assets/mv39/**","/assets/mv40/**","/assets/mv43/**"};
        http.csrf(csrf->csrf.disable())
            .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .requestCache(c->c.disable())
            .authorizeHttpRequests(auth->auth.requestMatchers(HttpMethod.GET,reads).permitAll()
                .requestMatchers(HttpMethod.HEAD,reads).permitAll().anyRequest().denyAll())
            .exceptionHandling(e->e.authenticationEntryPoint((req,res,error)->res.setStatus(403))
                .accessDeniedHandler((req,res,error)->res.setStatus(403)));
        return http.build();
    }
    @Override public void addResourceHandlers(ResourceHandlerRegistry registry) {
        for(String family:new String[]{"mv39","mv40","mv43"})
            registry.addResourceHandler("/assets/"+family+"/**").addResourceLocations("classpath:/static/assets/"+family+"/");
    }
}
