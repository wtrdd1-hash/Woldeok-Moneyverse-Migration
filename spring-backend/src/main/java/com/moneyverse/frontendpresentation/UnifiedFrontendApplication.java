package com.moneyverse.frontendpresentation;

import com.moneyverse.adminpresentation.*;
import com.moneyverse.api.domain.admin.web.AdminNavigation;
import com.moneyverse.api.domain.health.NativeBuildIdentity;
import com.moneyverse.api.domain.tools.SpringNativeCalculatorsController;
import com.moneyverse.api.domain.tools.SpringNativeToolHubController;
import com.moneyverse.api.domain.web.*;
import com.moneyverse.presentation.NativePresentationIdentityController;
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

/** One renderer replaces per-page JVMs without starting another economic or session authority. */
@Configuration(proxyBeanMethods=false)
@EnableAutoConfiguration(exclude={DataSourceAutoConfiguration.class,JdbcTemplateAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class,UserDetailsServiceAutoConfiguration.class})
@Import({NativeHomeController.class,SpringNativeToolHubController.class,SpringNativeCalculatorsController.class,
    UiLocale.class,UiPageRenderer.class,AdminNavigation.class,NativeBuildIdentity.class,NativePresentationIdentityController.class,
    AdminSourceClient.class,AdminUiController.class,AdminReadPageController.class,AdminDeliveryPageController.class,
    FrontendIdentityController.class,MemberPresentationPageController.class,AdminProbePageController.class,NativeAuthPageController.class})
public class UnifiedFrontendApplication implements WebMvcConfigurer {
    private static final String[] READS={"/","/index.html","/tools","/calculators","/tools/compound-calculator","/tools/stock-calculator",
        "/admin","/admin/","/admin/users","/admin/market","/admin/controls","/admin/enterprises","/admin/economy",
        "/admin/economy/scenario-lab","/admin/logs/system","/admin/logs/delivery","/admin/api-health",
        "/wallet","/wallet/","/wallet.html","/wallet/index.html","/support","/support/","/support.html","/support/index.html",
        "/chat","/chat/","/chat.html","/chat/index.html",
        "/frontend-version","/presentation-health","/admin-ui-health","/admin-ui-version","/frontend-ui-health","/frontend-ui-version",
        "/assets/mv39/**","/assets/mv40/**","/assets/mv43/**"};
    private static final String[] AUTH_PAGES=authPages();
    private static String[] authPages(){
        var result=new java.util.ArrayList<String>();
        for(String page:new String[]{"login","login/providers","register","forgot-password","reset-password","verify-email","verify-email-change","account-deletion"})
            for(String suffix:new String[]{"","/",".html","/index.html"})result.add("/"+page+suffix);
        return result.toArray(String[]::new);
    }
    @Bean SecurityFilterChain frontendSecurity(HttpSecurity http) throws Exception {
        http.csrf(csrf->csrf.disable()).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .requestCache(c->c.disable()).authorizeHttpRequests(a->a.requestMatchers(HttpMethod.GET,READS).permitAll()
                .requestMatchers(HttpMethod.HEAD,READS).permitAll().requestMatchers(HttpMethod.GET,AUTH_PAGES).permitAll()
                .requestMatchers(HttpMethod.HEAD,AUTH_PAGES).permitAll().anyRequest().denyAll())
            .exceptionHandling(e->e.authenticationEntryPoint((req,res,error)->res.setStatus(403))
                .accessDeniedHandler((req,res,error)->res.setStatus(403)));
        return http.build();
    }
    @Override public void addResourceHandlers(ResourceHandlerRegistry registry){
        for(String family:new String[]{"mv39","mv40","mv43"})registry.addResourceHandler("/assets/"+family+"/**")
            .addResourceLocations("classpath:/static/assets/"+family+"/");
    }
}
