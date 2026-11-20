package com.moneyverse.api.domain.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

@Component("localeResolver")
public class UiLocale implements LocaleResolver {
    private static final List<String> SUPPORTED = List.of("en", "ko", "ja", "zh", "vi");
    private final Map<String,List<String>> catalog;

    public UiLocale(ObjectMapper mapper) {
        try (var input = new ClassPathResource("ui/mv43-copy.json").getInputStream()) {
            catalog = mapper.readValue(input, new TypeReference<Map<String,List<String>>>() {});
            if (catalog.values().stream().anyMatch(values -> values.size() != SUPPORTED.size()
                    || values.stream().anyMatch(value -> value == null || value.isBlank()))) {
                throw new IllegalStateException("UI locale catalog is incomplete");
            }
        } catch (IOException error) {
            throw new IllegalStateException("UI locale catalog unavailable", error);
        }
    }

    public String resolve(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("wdmv_locale".equals(cookie.getName()) && SUPPORTED.contains(cookie.getValue())) return cookie.getValue();
            }
        }
        String header = request.getHeader("Accept-Language");
        if (header == null || header.length() > 4096) return "en";
        try {
            for (var range : Locale.LanguageRange.parse(header)) {
                if (range.getWeight() == 0) continue;
                String code = range.getRange().split("-")[0];
                if (SUPPORTED.contains(code)) return code;
            }
        } catch (IllegalArgumentException ignored) {
            // Untrusted language metadata must not turn a public page into a server error.
        }
        return "en";
    }

    public String resolvePublic(HttpServletRequest request) {
        if(request.getCookies()!=null) {
            for(var cookie:request.getCookies()) {
                if("wdmv_locale".equals(cookie.getName())&&SUPPORTED.contains(cookie.getValue())) return cookie.getValue();
            }
        }
        String explicit=request.getParameter("lang");
        if(explicit!=null&&SUPPORTED.contains(explicit.toLowerCase(Locale.ROOT))) return explicit.toLowerCase(Locale.ROOT);
        return resolve(request);
    }

    @Override
    public Locale resolveLocale(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (List.of("/", "/index.html", "/wallet", "/wallet/", "/wallet.html", "/wallet/index.html").contains(path) || path.matches("^/(login|register|forgot-password|reset-password|verify-email|verify-email-change|account-deletion)(/|\\.html|/index\\.html)?$") || path.matches("^/login/providers(/|\\.html|/index\\.html)?$")) return Locale.forLanguageTag(resolve(request));
        if (List.of("/tools","/calculators","/tools/compound-calculator","/tools/stock-calculator","/status").contains(path))
            return Locale.forLanguageTag(resolvePublic(request));
        if(path.matches("^/(support|chat)(/|\\.html|/index\\.html)?$")) return Locale.forLanguageTag(resolve(request));
        // Existing route families retain their locale behavior until their native migration.
        return new AcceptHeaderLocaleResolver().resolveLocale(request);
    }

    @Override
    public void setLocale(HttpServletRequest request, HttpServletResponse response, Locale locale) {
        throw new UnsupportedOperationException("Manual locale selection uses the shared preference cookie");
    }

    public Map<String,String> labels(String language) {
        int index = SUPPORTED.indexOf(language);
        if (index < 0) index = 0;
        Map<String,String> result = new LinkedHashMap<>();
        for (var entry : catalog.entrySet()) result.put(entry.getKey(), entry.getValue().get(index));
        return Collections.unmodifiableMap(result);
    }
}
