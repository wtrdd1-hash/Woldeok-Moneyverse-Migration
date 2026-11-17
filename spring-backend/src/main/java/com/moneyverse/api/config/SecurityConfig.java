package com.moneyverse.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // SWF routes have no verified session/CSRF/step-up binding yet.
                        // Deny all aliases until the real authorization boundary is implemented.
                        .requestMatchers(
                                "/api/v1/admin/treasury/swf", "/api/v1/admin/treasury/swf/**",
                                "/api/admin/treasury/swf", "/api/admin/treasury/swf/**",
                                "/api/treasury/swf", "/api/treasury/swf/**",
                                "/api/v1/treasury/swf", "/api/v1/treasury/swf/**"
                        ).denyAll()
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/favicon.ico",
                                "/robots.txt",
                                "/sitemap.xml",
                                "/llms.txt",
                                "/static/**",
                                "/assets/**",
                                "/_next/**",
                                "/health",
                                "/api/version",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        .anyRequest().permitAll() // 마이그레이션 단계에서는 컨트롤러/인터셉터 수준에서 세부 권한 검증
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
                "https://easy-scraping.com",
                "https://www.easy-scraping.com",
                "http://localhost:3000",
                "http://localhost:4501",
                "http://127.0.0.1:4501",
                "http://127.0.0.1:4550",
                "http://localhost:4550"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
