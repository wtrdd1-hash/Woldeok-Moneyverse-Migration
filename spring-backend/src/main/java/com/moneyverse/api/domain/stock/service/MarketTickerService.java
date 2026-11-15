package com.moneyverse.api.domain.stock.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "moneyverse.market.ticker-enabled", havingValue = "true", matchIfMissing = true)
public class MarketTickerService {

    private static final Logger log = LoggerFactory.getLogger(MarketTickerService.class);

    private final StockService stockService;

    public MarketTickerService(StockService stockService) {
        this.stockService = stockService;
    }

    /**
     * 매 1초마다 어드바이저리 락을 경유하여 가상 주식 가격 워크를 1스텝 전진
     */
    @Scheduled(fixedDelayString = "${moneyverse.market.ticker-delay-ms:1000}", initialDelay = 3000)
    public void tickMarket() {
        try {
            int moved = stockService.liveTick();
            if (moved > 0) {
                log.debug("Market ticker updated {} stocks", moved);
            }
        } catch (Exception e) {
            log.warn("Market ticker tick execution failed: {}", e.getMessage());
        }
    }
}
