-- Migration 258: Treasury Capital Governance & Investment Ratio Limits
-- 목적: 국고 자금의 시스템 필수 용도(비상 유동성, 인프라, 통화안정, 복지) 안전 보존을 위해
-- 국부펀드(ASWF) 잉여 세수 재투자 비율을 기존 70%에서 기본 15%로 안전 하향하고,
-- 국고 총자산 대비 최대 투자 상한 비율(기본 20%) 및 관리자 제어 거버넌스 스키마 추가.

-- 1. treasury_swf_configs 테이블에 재투자 비율 및 최대 투자 상한 컬럼 추가
ALTER TABLE public.treasury_swf_configs
  ADD COLUMN IF NOT EXISTS reinvestment_ratio_pct NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
  ADD COLUMN IF NOT EXISTS max_investment_ratio_pct NUMERIC(5, 2) NOT NULL DEFAULT 20.00;

-- 2. 현재 활성 설정 레코드에 보수적/안전 거버넌스 수치 적용
UPDATE public.treasury_swf_configs
SET reinvestment_ratio_pct = 15.00,
    max_investment_ratio_pct = 20.00,
    safe_reserve_wld = GREATEST(safe_reserve_wld, 25000000),
    updated_at = clock_timestamp()
WHERE id = 'current';

-- 3. 감사 로그 기록용 이벤트 등록
INSERT INTO public.treasury_swf_events (event_type, amount_wld, summary, metadata)
VALUES (
    'GOVERNANCE_RATIO_UPDATED',
    0,
    '국고 자금 헌법적 거버넌스 발효: 재투자 허용 비율 15%, 국고 총자산 대비 최대 투자 상한 20% 규제 적용 (국고 자금 80% 이상 시스템 필수 금고 안전 보존)',
    jsonb_build_object(
        'reinvestment_ratio_pct', 15.00,
        'max_investment_ratio_pct', 20.00,
        'safe_reserve_wld', 25000000,
        'timestamp', clock_timestamp()
    )
);
