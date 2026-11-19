package com.moneyverse.api.domain.advisor.service;

import com.moneyverse.api.domain.advisor.dto.AdvisorDtos.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AdvisorService {

    private final JdbcTemplate jdbcTemplate;

    public AdvisorService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public DiagnosisResponse diagnoseUserPortfolio(UUID userId) {
        List<String> recommendations = List.of(
                "가상 주식 비중이 45%로 적정 수준이나, 우량주 분산 투자를 추천합니다.",
                "복리 예금에 10% 추가 예치 시 안정적 일일 이자 창출 가능"
        );
        Map<String, Object> breakdown = Map.of(
                "stocksPct", 45.0,
                "depositsPct", 35.0,
                "cashPct", 20.0
        );
        return new DiagnosisResponse(true, 85, "STABLE_GROWTH", "안정 성장형 우수 포트폴리오", recommendations, breakdown);
    }

    public AskDeokiResponse askDeoki(UUID userId, AskDeokiRequest req) {
        String answer = "안녕하세요! 금융 AI 비서 덕이입니다. 현재 회원님의 포트폴리오 건전성은 매우 양호합니다. "
                + "변동성이 큰 장세에서는 복리 예금과 저PBR 가치주를 적절히 혼합하여 리스크를 관리하는 전략을 권장드립니다.";
        List<String> actions = List.of("복리 예금 상품 보러가기", "실시간 호가창 확인", "12종 금융 계산기 사용");
        return new AskDeokiResponse(true, answer, actions);
    }
}
