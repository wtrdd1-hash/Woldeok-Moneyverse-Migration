package com.moneyverse.api.domain.shop.service;

import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** The application never receives raw catalog privileges; the function checks the current actor. */
@Service
public final class AdminShopService {
    private final JdbcTemplate jdbc;
    public AdminShopService(JdbcTemplate jdbc){this.jdbc=jdbc;}
    public List<Map<String,Object>> list(UUID actor,String category){
        if(actor==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"SESSION_REQUIRED");
        if(category!=null&&(category.length()>80||category.chars().anyMatch(Character::isISOControl)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"INVALID_SHOP_CATEGORY");
        try{
            List<Map<String,Object>> rows=jdbc.query("""
                SELECT id::text, code, name, description, category, base_price::text,
                       rarity, max_stock, current_stock, is_limited, active, purchase_limit
                FROM public.admin_shop_items(?::uuid)
                """,(rs,index)->{
                    Map<String,Object> row=new LinkedHashMap<>();
                    for(String field:List.of("id","code","name","category","base_price","purchase_limit"))row.put(field,rs.getString(field));
                    row.put("description",Objects.requireNonNullElse(rs.getString("description"),""));
                    row.put("rarity",Objects.requireNonNullElse(rs.getString("rarity"),""));
                    row.put("max_stock",rs.getObject("max_stock",Integer.class));
                    row.put("current_stock",rs.getObject("current_stock",Integer.class));
                    row.put("is_limited",rs.getBoolean("is_limited"));row.put("active",rs.getBoolean("active"));
                    return row;
                },actor);
            if(rows==null)throw new IllegalStateException("Canonical catalog returned no result set");
            if(category==null||category.isBlank())return rows;
            return rows.stream().filter(row->category.strip().equalsIgnoreCase((String)row.get("category"))).toList();
        }catch(ResponseStatusException failure){throw failure;}
        catch(Exception failure){
            for(Throwable cause=failure;cause!=null;cause=cause.getCause())
                if(cause instanceof java.sql.SQLException sql&&"42501".equals(sql.getSQLState())
                    &&sql.getMessage()!=null&&sql.getMessage().contains("administrator role required"))
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,"ADMIN_ROLE_REQUIRED");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"ADMIN_SHOP_SOURCE_UNAVAILABLE");
        }
    }
}
