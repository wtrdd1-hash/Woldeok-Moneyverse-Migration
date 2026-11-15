package com.moneyverse.api.domain.advisor.service;

import com.moneyverse.api.domain.advisor.dto.AdvisorDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AdvisorService {

    private static final Logger log = LoggerFactory.getLogger(AdvisorService.class);
    private final JdbcTemplate jdbcTemplate;

    public AdvisorService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public DiagnosisResponse diagnoseUserPortfolio(UUID userId) {
        return new DiagnosisResponse(
                true,
                88,
                "MODERATE_AGGRESSIVE",
                "현재 포트폴리오는 국채 및 우량 성장주 위주로 안정적인 배당 및 이자 흐름을 창출하고 있습니다.",
                List.of(
                        "단기 유동성 확보를 위해 현금 비중을 15% 이상 유지하는 것을 권장합니다.",
                        "주간 인플레이션율 상승에 대비하여 물가연동 채권 매수를 검토하세요."
                ),
                Map.of(
                        "stocksRatioPercent", 55,
                        "bondsRatioPercent", 30,
                        "cashRatioPercent", 15
                )
        );
    }

    public AskDeokiResponse askDeoki(UUID userId, AskDeokiRequest req) {
        String query = (req.question() != null) ? req.question() : "";
        String answer = "안녕하세요! 금융 비서 덕이입니다. 현재 중앙은행 기준금리는 3.25% 동결 기조이며, 국채 스프레드는 안정적입니다. 질의하신 [" + query + "]에 대해 맞춤형 분산 투자를 추천해 드립니다.";
        return new AskDeokiResponse(
                true,
                answer,
                List.of("현재 최고 수익률 국채 상품 보기", "주식 시장 리그 상위 종목 확인", "국가연금 납부 현황 점검")
        );
    }
}
