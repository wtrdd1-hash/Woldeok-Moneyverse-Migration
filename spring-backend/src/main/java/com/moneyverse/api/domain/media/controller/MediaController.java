package com.moneyverse.api.domain.media.controller;

import com.moneyverse.api.domain.media.service.ImageStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Tag(name = "Media", description = "발행된 갤러리 사진 및 정적 미디어 바이너리 서빙 API")
@RestController
public class MediaController {

    private final ImageStorageService storageService;
    private final JdbcTemplate jdbcTemplate;

    public MediaController(ImageStorageService storageService, JdbcTemplate jdbcTemplate) {
        this.storageService = storageService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping(path = {
            "/media/{key}",
            "/media/profile/{key}"
    })
    @Operation(summary = "발행된 사진 및 프로필 아바타 바이너리 스트리밍 (1년 캐시 및 불변 헤더)")
    public ResponseEntity<byte[]> getMedia(@PathVariable("key") String key) {
        Optional<byte[]> bytes = storageService.read(key);
        if (bytes.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String mimeType = storageService.getMimeTypeFor(key);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(mimeType));
        headers.setContentLength(bytes.get().length);
        headers.set("Cache-Control", "public, max-age=86400, immutable");
        headers.set("X-Content-Type-Options", "nosniff");

        return new ResponseEntity<>(bytes.get(), headers, HttpStatus.OK);
    }
}
