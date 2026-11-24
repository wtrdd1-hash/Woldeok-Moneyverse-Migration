package com.moneyverse.frontendpresentation;

import com.fasterxml.jackson.databind.JsonNode;
import com.moneyverse.api.domain.content.PublicationPolicy;
import com.moneyverse.api.domain.web.UiPageRenderer;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Public source data is fetched without a visitor identity; filters never leave the verified window. */
@Controller
public final class PublicPublicationPageController {
    private final PublicSourceClient source;
    private final UiPageRenderer pages;
    private final com.moneyverse.api.domain.web.UiLocale locale;
    public PublicPublicationPageController(PublicSourceClient source,UiPageRenderer pages,com.moneyverse.api.domain.web.UiLocale locale){this.source=source;this.pages=pages;this.locale=locale;}
    @GetMapping(value={"/announcements","/announcements/","/announcements.html","/announcements/index.html"},produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> announcements(HttpServletRequest request){return show(request,false);}
    @GetMapping(value={"/gallery","/gallery/","/gallery.html","/gallery/index.html"},produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> gallery(HttpServletRequest request){return show(request,true);}
    private ResponseEntity<String> show(HttpServletRequest request,boolean gallery){
        var headers=new HttpHeaders();headers.setContentType(MediaType.parseMediaType("text/html;charset=UTF-8"));
        headers.set("Cache-Control","private, no-store");headers.set("Vary","Cookie, Accept-Language");
        headers.set("Content-Language",pages.publicLanguage(request));headers.set("X-Content-Type-Options","nosniff");headers.set("X-Frame-Options","DENY");headers.set("X-MV-Renderer","Spring-MVC-Thymeleaf");
        headers.set("Content-Security-Policy",csp(Set.of()));
        if("1".equals(request.getHeader("RSC"))||request.getParameter("_rsc")!=null)return new ResponseEntity<>("",headers,HttpStatus.NOT_ACCEPTABLE);
        int limit=gallery?24:20;String family=gallery?"gallery":"announcements",key=gallery?"photos":"announcements";
        List<Map<String,Object>> rows=List.of();Set<String> hosts=new TreeSet<>();boolean unavailable=false;
        try{rows=parse(source.read(gallery?"/api/v1/content/photos":"/api/v1/announcements"),gallery,limit,hosts);}
        catch(Exception failure){unavailable=true;hosts.clear();}
        String q=Objects.requireNonNullElse(request.getParameter("q"),"").strip();if(q.length()>160)q=q.substring(0,160);
        String query=q.toLowerCase(Locale.ROOT);int window=rows.size();
        var filtered=rows.stream().filter(row->String.valueOf(gallery?row.get("altText"):row.get("title")+" "+row.get("body")).toLowerCase(Locale.ROOT).contains(query)).toList();
        var model=new HashMap<String,Object>();model.put("uiPageKey",gallery?"publicationGallery":"publicationAnnouncements");
        model.put("publicTitleKey",model.get("uiPageKey"));model.put("fullPageTitle",java.util.Objects.requireNonNull(locale.labels(pages.publicLanguage(request)).get(String.valueOf(model.get("uiPageKey"))))+" | Woldeok Moneyverse");model.put("language",pages.publicLanguage(request));model.put("sourceUnavailable",unavailable);
        model.put("rows",filtered);model.put("query",q);model.put("window",window);model.put("limit",limit);model.put("family",family);
        headers.set("Content-Security-Policy",csp(hosts));if(unavailable)headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
        return new ResponseEntity<>(pages.renderPublic("mv46/"+family,request,model),headers,unavailable?HttpStatus.SERVICE_UNAVAILABLE:HttpStatus.OK);
    }
    private static List<Map<String,Object>> parse(JsonNode data,boolean gallery,int limit,Set<String> hosts){
        JsonNode values=data.path(gallery?"photos":"announcements");if(!values.isArray()||values.size()>limit)throw new IllegalArgumentException();
        var rows=new ArrayList<Map<String,Object>>();var ids=new HashSet<String>();
        for(JsonNode value:values){
            if(!value.isObject())throw new IllegalArgumentException();String id=PublicationPolicy.id(text(value,gallery?"photoId":"announcementId"));if(!ids.add(id))throw new IllegalArgumentException();
            var row=new HashMap<String,Object>();row.put("id",id);row.put("publishedAt",PublicationPolicy.published(text(value,"publishedAt")));
            if(gallery){var image=PublicationPolicy.image(text(value,"imageUrl"));row.put("imageUrl",image.toString());row.put("altText",PublicationPolicy.text(text(value,"altText"),300,false));
                // Only the canonical function certifies host approval; CSP admits the exact validated returned hosts.
                if(image.getHost()!=null)hosts.add("https://"+image.getHost());
            }else{
                row.put("title",PublicationPolicy.text(text(value,"title"),160,false));row.put("body",PublicationPolicy.text(text(value,"body"),12000,true));
                if(!value.path("isPinned").isBoolean())throw new IllegalArgumentException();row.put("isPinned",value.path("isPinned").booleanValue());
                JsonNode image=value.path("imageUrl"),alt=value.path("imageAltText");
                if(image.isNull()&&alt.isNull()){row.put("imageUrl",null);row.put("imageAltText",null);}
                else{row.put("imageUrl",PublicationPolicy.announcementImage(text(value,"imageUrl")).toString());row.put("imageAltText",PublicationPolicy.text(text(value,"imageAltText"),300,false));}
            }
            rows.add(Collections.unmodifiableMap(row));
        }return List.copyOf(rows);
    }
    private static String text(JsonNode row,String key){JsonNode v=row.path(key);if(!v.isTextual())throw new IllegalArgumentException();return v.textValue();}
    private static String csp(Set<String> hosts){return "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'"+(hosts.isEmpty()?"":" "+String.join(" ",hosts))+"; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'";}
}
