package com.moneyverse.api.domain.business.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/businesses/ventures",
        "/api/businesses/ventures",
        "/businesses/ventures"
})
public class VenturesController {

    @GetMapping("/pitches")
    public ResponseEntity<Map<String, Object>> listPitches() {
        List<Map<String, Object>> pitches = List.of(
                Map.of(
                        "id", "v-pitch-neotech",
                        "companyName", "네오테크 클라우드 AI",
                        "industry", "생성형 AI & 클라우드 인프라",
                        "targetFundingWld", 5000000L,
                        "currentFundingWld", 3850000L,
                        "valuationWld", 25000000L,
                        "progressPct", 77.0,
                        "dividendYieldPct", 8.5,
                        "founder", "NeoCoder",
                        "description", "대규모 언어모델 분산 인퍼런스 및 실시간 가상경제 최적화 엔진 제공"
                ),
                Map.of(
                        "id", "v-pitch-biomedi",
                        "companyName", "바이오메디컬 나노랩",
                        "industry", "디지털 헬스케어 & 신약",
                        "targetFundingWld", 3000000L,
                        "currentFundingWld", 2400000L,
                        "valuationWld", 15000000L,
                        "progressPct", 80.0,
                        "dividendYieldPct", 7.2,
                        "founder", "BioMaster",
                        "description", "스마트 헬스케어 웨어러블 디바이스 및 유전자 분석 알고리즘 연구"
                ),
                Map.of(
                        "id", "v-pitch-quant",
                        "companyName", "월덱 퀀트 인텔리전스",
                        "industry", "핀테크 & 알고리즘 트레이딩",
                        "targetFundingWld", 8000000L,
                        "currentFundingWld", 6200000L,
                        "valuationWld", 40000000L,
                        "progressPct", 77.5,
                        "dividendYieldPct", 11.4,
                        "founder", "QuantGenius",
                        "description", "고빈도 매매(HFT) 및 머신러닝 차익거래 펀드 운용"
                )
        );
        return ResponseEntity.ok(Map.of(
                "success", true,
                "pitches", pitches
        ));
    }

    @GetMapping("/investments")
    public ResponseEntity<Map<String, Object>> listMyInvestments() {
        List<Map<String, Object>> investments = List.of(
                Map.of(
                        "investmentId", "inv-001",
                        "ventureId", "v-pitch-neotech",
                        "ventureName", "네오테크 클라우드 AI",
                        "investedAmountWld", 50000L,
                        "equityRatioPct", 0.2,
                        "currentValueWld", 62500L,
                        "totalDividendsReceivedWld", 4250L,
                        "investedAt", new Date(System.currentTimeMillis() - 864000000L).toInstant().toString()
                )
        );
        return ResponseEntity.ok(Map.of(
                "success", true,
                "investments", investments,
                "totalInvestedWld", 50000L,
                "totalValueWld", 62500L
        ));
    }

    @PostMapping("/invest")
    public ResponseEntity<Map<String, Object>> investVenture(@RequestBody(required = false) Map<String, Object> body) {
        String ventureId = body != null && body.containsKey("ventureId") ? body.get("ventureId").toString() : "v-pitch-neotech";
        long amount = body != null && body.containsKey("amount") ? Long.parseLong(body.get("amount").toString()) : 10000L;
        return ResponseEntity.ok(Map.of(
                "success", true,
                "investmentId", "inv-" + UUID.randomUUID().toString().substring(0, 8),
                "ventureId", ventureId,
                "investedAmountWld", amount,
                "status", "CONFIRMED",
                "message", "벤처 투자가 성공적으로 완료되었습니다."
        ));
    }

    @PostMapping("/claim-dividend")
    public ResponseEntity<Map<String, Object>> claimDividend(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "claimedAmountWld", 4250L,
                "receiptId", "div-rcpt-" + UUID.randomUUID().toString().substring(0, 8),
                "message", "벤처 배당금이 성공적으로 수령되어 지갑에 입금되었습니다."
        ));
    }

    @PostMapping("/apply-founder")
    public ResponseEntity<Map<String, Object>> applyFounderPitch(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "pitchId", "v-pitch-" + UUID.randomUUID().toString().substring(0, 8),
                "status", "UNDER_REVIEW",
                "message", "창업 IR 피치가 성공적으로 접수되었습니다. 심사 후 펀딩이 개시됩니다."
        ));
    }
}
