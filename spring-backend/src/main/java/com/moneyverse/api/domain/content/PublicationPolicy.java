package com.moneyverse.api.domain.content;

import java.net.URI;
import java.time.Instant;
import java.util.UUID;

/** Validate publication evidence without granting presentation access to a database or image server. */
public final class PublicationPolicy {
    private PublicationPolicy() {}
    public static String id(String value) {
        if(value==null || !value.matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}") || !UUID.fromString(value).toString().equals(value)) throw new IllegalArgumentException("Invalid publication ID");
        return value;
    }
    public static String text(String value,int maximum,boolean multiline) {
        if(value==null || value.isBlank() || value.length()>maximum || !value.equals(value.strip()) || value.chars().anyMatch(c->Character.isISOControl(c) && !(multiline && c=='\n'))) throw new IllegalArgumentException("Invalid publication text");
        return value;
    }
    public static String published(String value) {
        if(value==null || Instant.parse(value).isAfter(Instant.now())) throw new IllegalArgumentException("Invalid publication time");
        return Instant.parse(value).toString();
    }
    public static URI announcementImage(String value) {
        if(value==null||!value.startsWith("/media/"))throw new IllegalArgumentException("Invalid announcement media root");
        return image(value);
    }
    public static URI image(String value) {
        text(value,2048,false);
        if(value.startsWith("/media/")) {
            String key=value.substring(7);
            if(key.length()<1 || key.length()>255 || !key.matches("[A-Za-z0-9][A-Za-z0-9._/-]*") || key.contains("//") || java.util.Arrays.stream(key.split("/",-1)).anyMatch(segment->segment.equals(".")||segment.equals(".."))) throw new IllegalArgumentException("Invalid publication storage key");
            return URI.create(value);
        }
        URI uri=URI.create(value);String host=uri.getHost();
        if(!"https".equals(uri.getScheme()) || host==null || host.length()>253 || !host.matches("[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+") || host.matches("[0-9.]+") || uri.getRawUserInfo()!=null || (uri.getPort()!=-1 && uri.getPort()!=443) || uri.getRawFragment()!=null || !uri.getRawPath().startsWith("/") || value.contains("\\")) throw new IllegalArgumentException("Invalid publication image");
        return uri;
    }
}
