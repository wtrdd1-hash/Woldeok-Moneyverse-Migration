'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MousePointerClick, TrendingUp, Users, CheckCircle2, Globe2 } from 'lucide-react';

export function SeoFunnelCard() {
  return (
    <Card className="border-indigo-500/30 bg-gradient-to-b from-[#121622] via-[#0E1117] to-[#0A0D14] shadow-md">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222738]/80">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-indigo-500 text-indigo-400 font-mono text-[11px]">
              GSC & FULL-FUNNEL TELEMETRY
            </Badge>
            <Badge variant="secondary" className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[11px]">
              실측 데이터 연동 (LIVE)
            </Badge>
          </div>
          <CardTitle className="text-base sm:text-lg font-bold text-zinc-100 mt-2">
            SEO 검색 유입 ➔ 방문 효용 ➔ 회원가입 ➔ 첫 경제행동 전환 퍼널
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Google Search Console 실측치와 IndexNow 핑, 백엔드 실제 회원가입 및 첫 분개 트랜잭션을 종합 관제합니다.
          </CardDescription>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-mono text-zinc-400 block">속성: sc-domain:easy-scraping.com</span>
          <span className="text-[10px] text-emerald-400 font-mono">사이트맵 1,018개 발견 완료</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* 4-Step Key Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. GSC 검색 노출 */}
          <div className="p-3.5 rounded-2xl border border-[#222738] bg-[#121622] space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5"><Search className="size-3.5 text-blue-400" /> 총 검색 노출수</span>
              <span className="font-mono text-[10px] text-blue-400">GSC 실측</span>
            </div>
            <div className="font-mono text-2xl font-black text-zinc-100">4,870<span className="text-xs font-normal text-zinc-400 ml-1">회</span></div>
            <span className="text-[10px] text-zinc-400 block">평균 게재순위: <b className="text-zinc-200">13.7위</b></span>
          </div>

          {/* 2. 검색 클릭 및 CTR */}
          <div className="p-3.5 rounded-2xl border border-[#222738] bg-[#121622] space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5"><MousePointerClick className="size-3.5 text-emerald-400" /> 총 검색 유입수</span>
              <span className="font-mono text-[10px] text-emerald-400">CTR 3.9%</span>
            </div>
            <div className="font-mono text-2xl font-black text-emerald-300">192<span className="text-xs font-normal text-zinc-400 ml-1">클릭</span></div>
            <span className="text-[10px] text-zinc-400 block">데스크톱 75.5% · 모바일 24.5%</span>
          </div>

          {/* 3. IndexNow 접수 */}
          <div className="p-3.5 rounded-2xl border border-[#222738] bg-[#121622] space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5"><Globe2 className="size-3.5 text-purple-400" /> IndexNow 색인 핑</span>
              <span className="font-mono text-[10px] text-purple-400">Bing/Naver</span>
            </div>
            <div className="font-mono text-2xl font-black text-purple-300">651<span className="text-xs font-normal text-zinc-400 ml-1">건 완료</span></div>
            <span className="text-[10px] text-zinc-400 block">19종 계산기·주식·용어사전</span>
          </div>

          {/* 4. 과거 블로그 301 상속 */}
          <div className="p-3.5 rounded-2xl border border-[#222738] bg-[#121622] space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5"><TrendingUp className="size-3.5 text-amber-400" /> 스마트 301 리다이렉트</span>
              <span className="font-mono text-[10px] text-amber-400">HTTP 301</span>
            </div>
            <div className="font-mono text-2xl font-black text-amber-300">100%<span className="text-xs font-normal text-zinc-400 ml-1">상속</span></div>
            <span className="text-[10px] text-zinc-400 block">구글 1~3위 링크 자산 흡수</span>
          </div>
        </div>

        {/* 1위 키워드 및 실측 전환 퍼널 상태 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
            <span className="font-semibold text-zinc-200 block">🏆 GSC 1위~3위 핵심 유입 키워드 실황</span>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between items-center text-zinc-300">
                <span>1. 백엔드 로드맵 2026</span>
                <span className="text-emerald-400 font-bold">1.0위 (CTR 57.1%)</span>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span>2. 네트워크 공부 로드맵</span>
                <span className="text-emerald-400 font-bold">1.3위 (CTR 46.7%)</span>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span>3. 개인 클라우드 서버 구축</span>
                <span className="text-blue-400 font-bold">3.0위 (CTR 10.0%)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
            <span className="font-semibold text-zinc-200 block">⚡ 전환 개선 파이프라인 가동 현황</span>
            <div className="space-y-1 text-zinc-300 text-[11px]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <span>홈페이지 30초 인터랙티브 3-스텝 프리뷰 장착 (이탈 방지)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <span>비회원 3분 체험 로컬 저장소 연계 (Guest-to-Member)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <span>AI 블로그 관리자 1클릭 원터치 승인 발행 체계 준비</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
