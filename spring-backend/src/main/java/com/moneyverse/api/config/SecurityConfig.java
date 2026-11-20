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

    @org.springframework.beans.factory.annotation.Value("${moneyverse.app-base-url:${APP_BASE_URL:https://easy-scraping.com}}")
    private String appBaseUrl = "https://easy-scraping.com";

    static String configuredOrigin(String configured) {
        try {
            java.net.URI uri=java.net.URI.create(configured);
            String scheme=uri.getScheme()==null?"":uri.getScheme().toLowerCase(java.util.Locale.ROOT);
            String host=uri.getHost();
            boolean loopback="localhost".equalsIgnoreCase(host)||"127.0.0.1".equals(host)||"::1".equals(host)||"[::1]".equals(host);
            if(host==null||uri.getRawUserInfo()!=null||uri.getRawQuery()!=null||uri.getRawFragment()!=null
                    ||(uri.getRawPath()!=null&&!uri.getRawPath().isEmpty()&&!"/".equals(uri.getRawPath()))
                    ||(!"https".equals(scheme)&&!("http".equals(scheme)&&loopback))
                    ||uri.getPort()>65535) throw new IllegalArgumentException();
            int port=uri.getPort();
            if(("https".equals(scheme)&&port==443)||("http".equals(scheme)&&port==80)) port=-1;
            return new java.net.URI(scheme,null,host.toLowerCase(java.util.Locale.ROOT),port,null,null,null).toASCIIString();
        } catch(Exception failure) {
            throw new IllegalArgumentException("Configured application origin is invalid");
        }
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
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
        String origin=configuredOrigin(appBaseUrl);
        // Test must not borrow Production credentialed CORS authority or vice versa.
        configuration.setAllowedOrigins("https://easy-scraping.com".equals(origin)
                ? List.of(origin,"https://www.easy-scraping.com",
                    "http://localhost:3000","http://localhost:4501","http://127.0.0.1:4501",
                    "http://127.0.0.1:4550","http://localhost:4550") : List.of(origin));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
