package com.moneyverse.api.domain.media.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class ImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(ImageStorageService.class);
    private static final Pattern KEY_PATTERN = Pattern.compile("^[0-9a-f-]{36}\\.(png|jpg|webp)$");
    private static final long MAX_BYTES = 8 * 1024 * 1024; // 8 MiB

    private final Path storageDirectory;

    public ImageStorageService(@Value("${moneyverse.storage.path:/srv/moneyverse-data/media}") String storagePath) {
        Path p = Paths.get(storagePath);
        if (!p.isAbsolute()) {
            p = Paths.get(System.getProperty("java.io.tmpdir"), "moneyverse-media");
        }
        this.storageDirectory = p;
        try {
            Files.createDirectories(this.storageDirectory);
        } catch (IOException e) {
            log.warn("[ImageStorageService] Failed to create storage dir {}: {}", this.storageDirectory, e.getMessage());
        }
    }

    public static class ValidatedImage {
        private final String mimeType;
        private final String extension;

        public ValidatedImage(String mimeType, String extension) {
            this.mimeType = mimeType;
            this.extension = extension;
        }

        public String getMimeType() { return mimeType; }
        public String getExtension() { return extension; }
    }

    public static class StoredImage {
        private final String storageKey;
        private final String mimeType;
        private final long size;
        private final String url;

        public StoredImage(String storageKey, String mimeType, long size, String url) {
            this.storageKey = storageKey;
            this.mimeType = mimeType;
            this.size = size;
            this.url = url;
        }

        public String getStorageKey() { return storageKey; }
        public String getMimeType() { return mimeType; }
        public long getSize() { return size; }
        public String getUrl() { return url; }
    }

    public ValidatedImage validateImage(byte[] bytes) {
        if (bytes == null || bytes.length < 12) {
            throw new IllegalArgumentException("image must be at least 12 bytes");
        }
        if (bytes.length > MAX_BYTES) {
            throw new IllegalArgumentException("image may not exceed 8 MiB");
        }

        // Check PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
        if (bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47 &&
            bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A) {
            return new ValidatedImage("image/png", "png");
        }

        // Check JPEG magic bytes: FF D8 FF
        if (bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF) {
            return new ValidatedImage("image/jpeg", "jpg");
        }

        // Check WebP magic bytes: RIFF....WEBP
        if (bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
            bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return new ValidatedImage("image/webp", "webp");
        }

        throw new IllegalArgumentException("only PNG, JPEG and WebP image bytes are allowed");
    }

    public StoredImage save(byte[] bytes) throws IOException {
        ValidatedImage img = validateImage(bytes);
        String storageKey = UUID.randomUUID() + "." + img.getExtension();
        Path targetPath = storageDirectory.resolve(storageKey);

        Files.createDirectories(storageDirectory);
        Files.write(targetPath, bytes, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);

        String url = "/media/" + storageKey;
        return new StoredImage(storageKey, img.getMimeType(), bytes.length, url);
    }

    public Optional<byte[]> read(String storageKey) {
        if (storageKey == null || !KEY_PATTERN.matcher(storageKey).matches()) {
            return Optional.empty();
        }

        Path targetPath = storageDirectory.resolve(storageKey).normalize();
        if (!targetPath.startsWith(storageDirectory)) {
            return Optional.empty(); // Path traversal defense
        }

        if (!Files.exists(targetPath)) {
            return Optional.empty();
        }

        try {
            return Optional.of(Files.readAllBytes(targetPath));
        } catch (IOException e) {
            log.warn("[ImageStorageService] Read error for {}: {}", storageKey, e.getMessage());
            return Optional.empty();
        }
    }

    public boolean remove(String storageKey) {
        if (storageKey == null || !KEY_PATTERN.matcher(storageKey).matches()) {
            return false;
        }

        Path targetPath = storageDirectory.resolve(storageKey).normalize();
        if (!targetPath.startsWith(storageDirectory)) {
            return false;
        }

        try {
            return Files.deleteIfExists(targetPath);
        } catch (IOException e) {
            log.warn("[ImageStorageService] Delete error for {}: {}", storageKey, e.getMessage());
            return false;
        }
    }

    public String getMimeTypeFor(String storageKey) {
        if (storageKey == null) return "application/octet-stream";
        if (storageKey.endsWith(".png")) return "image/png";
        if (storageKey.endsWith(".webp")) return "image/webp";
        if (storageKey.endsWith(".jpg") || storageKey.endsWith(".jpeg")) return "image/jpeg";
        return "application/octet-stream";
    }
}
