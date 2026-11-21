package com.moneyverse.api.domain.stock.web;

import com.moneyverse.api.domain.stock.dto.StockDtos.StockMarketRow;
import com.moneyverse.api.domain.stock.service.StockService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PublicStocksReadOnlyPageTest {
    private StockMarketRow row(String id, String name) {
        return new StockMarketRow(id, "MV", name, "Source-backed equity", "1200", "1000", "1300", "900", "12000", "9000", "active", "2026-11-18T20:00:00Z");
    }

    @Test void publicStocksHaveRealOwnerSafeReadOnlyHtmlAndEnglishDefault() {
        StockService service = mock(StockService.class);
        when(service.list()).thenReturn(List.of(row("11111111-1111-1111-1111-111111111111", "Verified equity")));
        var result = new PublicStocksReadOnlyPage(service).show(null);
        assertEquals(200, result.getStatusCode().value());
        var html = result.getBody();
        assertNotNull(html);
        assertTrue(html.contains("data-page=\"stocks\""));
        assertTrue(html.contains("lang=\"en\""));
        assertTrue(html.contains("Verified equity"));
        assertTrue(html.contains("1 listed"));
        assertFalse(html.contains("Buy now"));
        assertTrue(html.contains("href=\"/support\""));
        verify(service, times(1)).list();
    }

    @Test void KoreanLocaleIsSupportedAndUntrustedStockNamesEscaped() {
        StockService service = mock(StockService.class);
        when(service.list()).thenReturn(List.of(row("id", "<script>attack</script>")));
        String html = new PublicStocksReadOnlyPage(service).show("ko").getBody();
        assertNotNull(html);
        assertTrue(html.contains("lang=\"ko\""));
        assertTrue(html.contains("상장 종목"));
        assertTrue(html.contains("&lt;script&gt;attack&lt;/script&gt;"));
        assertFalse(html.contains("<script>attack</script>"));
    }

    @Test void SourceFailureAndNoVerifiedStocksNeverInventAHealthyMarket() {
        StockService service = mock(StockService.class);
        when(service.list()).thenThrow(new IllegalStateException("DB source missing"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, assertThrows(ResponseStatusException.class,
                () -> new PublicStocksReadOnlyPage(service).show("en")).getStatusCode());
        doReturn(List.of()).when(service).list();
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, assertThrows(ResponseStatusException.class,
                () -> new PublicStocksReadOnlyPage(service).show("ko")).getStatusCode());
    }
}
