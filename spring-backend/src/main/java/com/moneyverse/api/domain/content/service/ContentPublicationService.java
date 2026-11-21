package com.moneyverse.api.domain.content.service;

import com.moneyverse.api.domain.content.PublicationPolicy;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** The existing definer functions alone decide publication and image-host approval. */
@Service
public final class ContentPublicationService {
    private final JdbcTemplate jdbc;
    public ContentPublicationService(JdbcTemplate jdbc){this.jdbc=jdbc;}
    public List<Map<String,Object>> announcements(String requestedLimit){
        int limit=limit(requestedLimit,20);
        try{return checked(jdbc.query("SELECT announcement_id,title,body,image_url,image_alt_text,is_pinned,published_at FROM public.content_list_published_announcements(?::integer)",(rs,i)->{
            Map<String,Object> row=new LinkedHashMap<>();
            row.put("announcementId",PublicationPolicy.id(rs.getString("announcement_id")));row.put("title",PublicationPolicy.text(rs.getString("title"),160,false));
            row.put("body",PublicationPolicy.text(rs.getString("body"),12000,true));row.put("publishedAt",published(rs));
            Boolean pinned=rs.getObject("is_pinned",Boolean.class);if(pinned==null)throw new IllegalArgumentException("Missing publication pin evidence");row.put("isPinned",pinned);
            String image=rs.getString("image_url"),alt=rs.getString("image_alt_text");
            if((image==null)!=(alt==null))throw new IllegalArgumentException("Invalid publication image pair");
            row.put("imageUrl",image==null?null:PublicationPolicy.announcementImage(image).toString());
            row.put("imageAltText",alt==null?null:PublicationPolicy.text(alt,300,false));return Collections.unmodifiableMap(row);
        },limit),limit,"announcementId");}
        catch(Exception failure){throw unavailable();}
    }
    public List<Map<String,Object>> photos(String requestedLimit){
        int limit=limit(requestedLimit,24);
        try{return checked(jdbc.query("SELECT photo_id,image_url,alt_text,published_at FROM public.content_list_published_photos(?::integer)",(rs,i)->Map.<String,Object>of(
            "photoId",PublicationPolicy.id(rs.getString("photo_id")),"imageUrl",PublicationPolicy.image(rs.getString("image_url")).toString(),
            "altText",PublicationPolicy.text(rs.getString("alt_text"),300,false),"publishedAt",published(rs)),limit),limit,"photoId");}
        catch(Exception failure){throw unavailable();}
    }
    private static String published(ResultSet rs)throws SQLException{return PublicationPolicy.published(rs.getTimestamp("published_at").toInstant().toString());}
    private static List<Map<String,Object>> checked(List<Map<String,Object>> rows,int limit,String id){
        if(rows==null||rows.size()>limit||rows.stream().map(row->row.get(id)).distinct().count()!=rows.size())throw unavailable();return List.copyOf(rows);
    }
    private static int limit(String value,int fallback){
        if(value==null)return fallback;
        try{if(!value.matches("[1-9][0-9]{0,2}"))throw new IllegalArgumentException();int n=Integer.parseInt(value);if(n>100)throw new IllegalArgumentException();return n;}
        catch(IllegalArgumentException invalid){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"INVALID_PUBLICATION_LIMIT");}
    }
    private static ResponseStatusException unavailable(){return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"PUBLICATION_SOURCE_UNAVAILABLE");}
}
