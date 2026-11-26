package com.moneyverse.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Locale;
import java.util.Set;

/**
 * Hides caller-supplied identity headers from every handler unless the member boundary has
 * replaced them with the verified session actor.
 *
 * Runs after SensitiveApiBoundaryFilter on purpose: that filter answers a mismatched header with
 * 403 forged_actor_header on member paths, which is a useful signal, and then substitutes the
 * verified actor. Everywhere else nothing legitimate sends these headers, so a handler that
 * reads one is reading attacker input. Stripping rather than rejecting keeps public reads that
 * a stale client decorates with the header working.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 12)
public class ActorHeaderSanitizingFilter extends OncePerRequestFilter {
    static final Set<String> ACTOR_HEADERS = Set.of("x-user-id", "x-actor-user-id", "x-admin-id");

    static boolean isActorHeader(String name) {
        return name != null && ACTOR_HEADERS.contains(name.toLowerCase(Locale.ROOT));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        // The member boundary substitutes the verified actor for X-User-Id / x-actor-user-id; nothing
        // substitutes X-Admin-Id, so it is hidden on verified member paths as well.
        boolean verified = request.getAttribute(SensitiveApiBoundaryFilter.VERIFIED_ACTOR_ATTRIBUTE) != null;
        java.util.function.Predicate<String> hidden = verified
                ? name -> name != null && "x-admin-id".equalsIgnoreCase(name)
                : ActorHeaderSanitizingFilter::isActorHeader;
        chain.doFilter(new HttpServletRequestWrapper(request) {
            @Override public String getHeader(String name) {
                return hidden.test(name) ? null : super.getHeader(name);
            }
            @Override public Enumeration<String> getHeaders(String name) {
                return hidden.test(name) ? Collections.emptyEnumeration() : super.getHeaders(name);
            }
            @Override public Enumeration<String> getHeaderNames() {
                return Collections.enumeration(Collections.list(super.getHeaderNames()).stream()
                        .filter(n -> !hidden.test(n)).toList());
            }
        }, response);
    }
}
