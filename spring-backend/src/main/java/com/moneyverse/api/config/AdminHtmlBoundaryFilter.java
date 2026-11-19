package com.moneyverse.api.config;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/** Protects *HTML and static aliases* at the Spring entrypoint, not just /api/admin/.
 * Existing AdminApiBoundaryFilter independently handles administrator JSON APIs.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 9)
public class AdminHtmlBoundaryFilter extends OncePerRequestFilter {
    private final AdminAuthService auth;

    public AdminHtmlBoundaryFilter(AdminAuthService auth) { this.auth=auth; }

    @Override protected boolean shouldNotFilter(HttpServletRequest request) {
        // Some historical JSON controllers use /admin/* without /api/*.
        // The HTML filter MUST NOT convert their anonymous 401 into a 302 redirect.
        if(!("GET".equals(request.getMethod()) || "HEAD".equals(request.getMethod()))) return true;
        String raw=request.getRequestURI();
        if(isSensitiveAdminPath(raw))return false;
        try { return !isSensitiveAdminPath(java.net.URLDecoder.decode(raw,StandardCharsets.UTF_8)); }
        catch(IllegalArgumentException badEncoding) { return true; }
    }

    private static final java.util.Set<String> SERVER_RENDERED_ADMIN_ROUTES=java.util.Set.of(
            "/admin", "/admin/users", "/admin/market", "/admin/controls", "/admin/economy",
            "/admin/enterprises", "/admin/economy/scenario-lab", "/admin-preview"
    );

    private static boolean isSensitiveAdminPath(String raw) {
        if(raw==null)return false;
        String path=raw.toLowerCase(java.util.Locale.ROOT);
        if(path.equals("/admin")||path.equals("/admin/")||path.equals("/admin.html")
                || path.equals("/admin-preview")||path.equals("/admin-preview/")
                || path.equals("/admin-preview.html"))return true;
        if(!(path.startsWith("/admin/")||path.startsWith("/admin-preview/")))return false;
        if(path.contains("..")||path.contains("\\"))return true;
        if(SERVER_RENDERED_ADMIN_ROUTES.contains(path)||SERVER_RENDERED_ADMIN_ROUTES.contains(path.replaceAll("/+$","")))return true;
        // Static admin HTML files have a trusted on-disk counterpart; API paths do not.
        String base="static"+path;
        if(path.endsWith(".html"))return new org.springframework.core.io.ClassPathResource(base).exists();
        return new org.springframework.core.io.ClassPathResource(base+".html").exists()
                || new org.springframework.core.io.ClassPathResource(base+"/index.html").exists();
    }

    @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)
            throws ServletException,IOException {
        response.setHeader("Cache-Control","private, no-store");
        response.setHeader("X-Robots-Tag","noindex, nofollow, noarchive");
        response.setHeader("X-Content-Type-Options","nosniff");
        response.setHeader("X-Frame-Options","DENY");
        response.setHeader("Referrer-Policy","no-referrer");
        if(auth.resolveVerifiedAdminActor(request).isEmpty()) {
            if(!("GET".equals(request.getMethod()) || "HEAD".equals(request.getMethod()))) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            String safePath=request.getRequestURI();
            response.setStatus(HttpServletResponse.SC_FOUND);
            response.setHeader("Location","/login?next="+URLEncoder.encode(safePath,StandardCharsets.UTF_8));
            return;
        }
        chain.doFilter(request,response);
    }
}
