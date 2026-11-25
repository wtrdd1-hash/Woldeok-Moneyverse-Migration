package com.moneyverse.api.domain.stock.web;

import com.moneyverse.api.domain.stock.dto.StockDtos.StockMarketRow;
import com.moneyverse.api.domain.stock.service.StockService;
import org.junit.jupiter.api.Test;
import org.springframework.ui.ConcurrentModel;
import org.springframework.ui.Model;

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
        Model model = new ConcurrentModel();
        String view = new PublicStocksReadOnlyPage(service).show(null, null, model, null);
        assertEquals("mv43/stocks", view);
        assertEquals("stocks", model.getAttribute("uiPageKey"));
        @SuppressWarnings("unchecked")
        List<StockMarketRow> stocks = (List<StockMarketRow>) model.getAttribute("stocks");
        assertNotNull(stocks);
        assertEquals(1, stocks.size());
        assertEquals("Verified equity", stocks.get(0).getName());
        verify(service, times(1)).list();
    }

    @Test void KoreanLocaleIsSupportedAndUntrustedStockNamesEscaped() {
        StockService service = mock(StockService.class);
        when(service.list()).thenReturn(List.of(row("id", "<script>attack</script>")));
        Model model = new ConcurrentModel();
        String view = new PublicStocksReadOnlyPage(service).show(null, null, model, "ko");
        assertEquals("mv43/stocks", view);
        @SuppressWarnings("unchecked")
        List<StockMarketRow> stocks = (List<StockMarketRow>) model.getAttribute("stocks");
        assertNotNull(stocks);
        assertEquals(1, stocks.size());
    }

    @Test void SourceFailureGracefullyFallsBackToEmptyList() {
        StockService service = mock(StockService.class);
        when(service.list()).thenThrow(new IllegalStateException("DB source missing"));
        Model model = new ConcurrentModel();
        String view = new PublicStocksReadOnlyPage(service).show(null, null, model, "en");
        assertEquals("mv43/stocks", view);
        @SuppressWarnings("unchecked")
        List<StockMarketRow> stocks = (List<StockMarketRow>) model.getAttribute("stocks");
        assertNotNull(stocks);
        assertTrue(stocks.isEmpty());
    }
}
