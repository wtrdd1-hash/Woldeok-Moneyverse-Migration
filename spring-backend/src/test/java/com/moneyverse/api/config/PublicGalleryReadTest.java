package com.moneyverse.api.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PublicGalleryReadTest {
    @Test void onlyTheListReadIsPublic() {
        assertTrue(SensitiveApiBoundaryFilter.isPublicGalleryRead("GET", "/api/v1/photos"));
        assertTrue(SensitiveApiBoundaryFilter.isPublicGalleryRead("HEAD", "/app-api/v1/photos/"));
        assertFalse(SensitiveApiBoundaryFilter.isPublicGalleryRead("POST", "/api/v1/photos"));
        assertFalse(SensitiveApiBoundaryFilter.isPublicGalleryRead("GET", "/api/v1/photos/mine"));
        assertFalse(SensitiveApiBoundaryFilter.isPublicGalleryRead("GET", "/api/v1/photos/withdraw"));
        assertFalse(SensitiveApiBoundaryFilter.isPublicGalleryRead("GET", "/api/v1/photos/uploads"));
        assertTrue(SensitiveApiBoundaryFilter.isMemberPrivatePath("/api/v1/photos/mine"));
    }
}
