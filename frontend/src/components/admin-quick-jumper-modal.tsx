'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Search,
  X,
  LayoutDashboard,
  BarChart3,
  Activity,
  Globe,
  Users,
  ShieldAlert,
  MessageCircle,
  Coins,
  Vault,
  Building,
  ScrollText,
  HeartHandshake,
  Shield,
  ArrowLeftRight,
  Building2,
  BriefcaseBusiness,
  ShoppingBag,
  ShieldCheck,
  Sliders,
  Megaphone,
  Radio,
  Landmark,
  TrendingUp,
  FileSpreadsheet,
  Newspaper,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

interface AdminRouteMeta {
  readonly href: string;
  readonly label: string;
  readonly description: string;
  readonly category: '총괄 & 시스템' | '거시 경제 & 국고' | '시장 & 비즈니스' | '트래픽 & SEO' | '회원 & 모더레이션' | '감사 로그 & 무결성';
  readonly icon: React.ElementType;
}

export const ALL_ADMIN_ROUTES: readonly AdminRouteMeta[] = [
  // 1. 총괄 & 시스템
  { href: '/admin', label: '대시보드', description: '활성 유저, 24h 유통량, 노드 가동률 총괄 관제', category: '총괄 & 시스템', icon: LayoutDashboard },
  { href: '/admin/analytics', label: '그래프 분석', description: '코호트, 잔존율, DAU/MAU 지표 통계 시각화', category: '총괄 & 시스템', icon: BarChart3 },
  { href: '/admin/api-health', label: 'API 관제 타워', description: '14대 도메인 300+개 API 헬스체크 및 레이턴시 모니터링', category: '총괄 & 시스템', icon: Activity },
  { href: '/admin/controls', label: '기능 스위치', description: '긴급 킬스위치, 피처 플래그 및 2FA 안전 토글', category: '총괄 & 시스템', icon: Sliders },
  { href: '/admin/security', label: '보안·차단', description: '의심 IP/세션 차단 및 Step-Up 2FA 모달 제어', category: '총괄 & 시스템', icon: ShieldAlert },

  // 2. 거시 경제 & 국고
  { href: '/admin/economy', label: '경제·원장', description: '중앙은행(MCB) 통화정책 명령서, 조폐국 발행/소각 인증서', category: '거시 경제 & 국고', icon: Coins },
  { href: '/admin/money-flow', label: '유저 자금 흐름 관제', description: '전체 유저 입출금, 주식, 상점, 급여, 카지노 실시간 원장 추적', category: '거시 경제 & 국고', icon: ArrowLeftRight },
  { href: '/admin/economy/scenario-lab', label: '경제 시나리오 랩', description: 'M2 통화량 시뮬레이션 및 다중 AI Council 심의 평가', category: '거시 경제 & 국고', icon: FileSpreadsheet },
  { href: '/admin/treasury', label: '국고·비축금', description: '2,500만 WLD 앵커, 85% 현금 정상화 및 자율 세수 회수', category: '거시 경제 & 국고', icon: Vault },
  { href: '/admin/enterprises', label: '공기업·지배구조', description: 'WSHC 산하 에너지/인프라/금융 3사 30% 배당 및 알리오 공시', category: '거시 경제 & 국고', icon: Building },
  { href: '/admin/bonds', label: '국채 거래소', description: '대한민국 국채(KTB) 3종 발행, 24시간 레포 대출 및 이자 지급', category: '거시 경제 & 국고', icon: ScrollText },
  { href: '/admin/pension', label: '국민연금 (NPS)', description: '5단계 공적 연금 적립, 국고 100% 매칭 및 평생 기초연금', category: '거시 경제 & 국고', icon: HeartHandshake },
  { href: '/admin/kdic', label: '예금보험공사', description: '1인당 50만 WLD 예금자보호, 예보기금 및 뱅크런 대위변제', category: '거시 경제 & 국고', icon: Shield },
  { href: '/admin/fx', label: '서울외환시장', description: '한국은행 100만 USD 외환보유액, 변동환율 및 스무딩 오퍼레이션', category: '거시 경제 & 국고', icon: ArrowLeftRight },
  { href: '/admin/bank', label: '은행·대출', description: '시중은행 지급준비율, 신용대출 리스크 및 예적금 금리', category: '거시 경제 & 국고', icon: Landmark },

  // 3. 시장 & 비즈니스
  { href: '/admin/market', label: '가상 시장', description: '10대 가상 상장사 호가창, 시장 감성 지수 및 틱 제어', category: '시장 & 비즈니스', icon: TrendingUp },
  { href: '/admin/market/ai-news', label: 'AI 시장 속보', description: 'LLM 기반 가상 증시 뉴스 및 긴급 기업 공시 생성', category: '시장 & 비즈니스', icon: Newspaper },
  { href: '/admin/catalog', label: '사업·시즌', description: '유저 사업체 등록 심사, 시즌 패스 퀘스트 및 티어 보상', category: '시장 & 비즈니스', icon: Building2 },
  { href: '/admin/work', label: '작업·직업', description: '8대 전문직 파밍 쿼터, 에너지 소모율 및 숙련도 승급', category: '시장 & 비즈니스', icon: BriefcaseBusiness },
  { href: '/admin/shop', label: '상점 관리', description: '아이템 인벤토리, 한정판 상품 재고 및 WLD 가격 정책', category: '시장 & 비즈니스', icon: ShoppingBag },

  // 4. 트래픽 & SEO
  { href: '/admin/seo', label: 'SEO·색인 관제', description: '실시간 검색 봇(Googlebot, Yeti) 크롤링 로그 & GSC/IndexNow', category: '트래픽 & SEO', icon: Globe },
  { href: '/admin/seo-audit', label: '크롤러 수집 감사', description: '구조화 데이터 무결성 검증 및 일괄 색인 핑 전송', category: '트래픽 & SEO', icon: Activity },

  // 5. 회원 & 모더레이션
  { href: '/admin/users', label: '회원 관리', description: '전체 유저 디렉토리, WLD 잔고 조정, 권한 부여 및 제재', category: '회원 & 모더레이션', icon: Users },
  { href: '/admin/support', label: '문의 채팅', description: '1:1 실시간 고객지원 티켓 및 관리자 전용 답변 콘솔', category: '회원 & 모더레이션', icon: MessageCircle },
  { href: '/admin/content', label: '공지·갤러리', description: '공식 공지사항 발행 및 커뮤니티 게시글 모더레이션', category: '회원 & 모더레이션', icon: Megaphone },
  { href: '/admin/safety', label: '안전·삭제', description: '미성년자 안전 보호 및 24시간 비회원 긴급 삭제(TAKE IT DOWN)', category: '회원 & 모더레이션', icon: ShieldCheck },
  { href: '/admin/discord', label: 'Discord 봇', description: '음성 상주 데몬, 음악 플레이어 및 관리자 1:1 DM 알림', category: '회원 & 모더레이션', icon: Radio },

  // 6. 감사 로그 & 무결성
  { href: '/admin/logs', label: '전역 감사 로그', description: '모든 관리자 권한 조작의 불변 시퀀스 및 감사 원장', category: '감사 로그 & 무결성', icon: ShieldCheck },
  { href: '/admin/logs/activity', label: '접속·체류 로그', description: '유저 로그인, 세션 갱신 및 주요 페이지 클릭 텔레메트리', category: '감사 로그 & 무결성', icon: Activity },
  { href: '/admin/logs/delivery', label: 'Discord 전달 로그', description: '디스코드 채널 및 관리자 DM 아웃박스 전송 성공/실패 원장', category: '감사 로그 & 무결성', icon: Radio },
  { href: '/admin/logs/integrity', label: '해시체인 무결성', description: 'PostgreSQL 감사 로그의 SHA-256 체인 위변조 전수 검증', category: '감사 로그 & 무결성', icon: CheckCircle2 },
];

export function AdminQuickJumperModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const pathname = usePathname();

  const filteredRoutes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_ADMIN_ROUTES;
    return ALL_ADMIN_ROUTES.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.href.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    );
  }, [search]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, AdminRouteMeta[]>();
    for (const r of filteredRoutes) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return map;
  }, [filteredRoutes]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="group flex min-h-[44px] sm:min-h-9 shrink-0 items-center gap-1.5 rounded-xl border-dashed border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-black text-primary hover:border-primary hover:bg-primary/10 transition-all shadow-xs"
        aria-label="31개 관리자 전체 메뉴 열기"
      >
        <Compass className="size-3.5 transition-transform group-hover:rotate-45 text-primary" />
        <span>전체 메뉴 (31)</span>
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative flex flex-col w-full max-w-3xl max-h-[85vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Compass className="size-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    관리자 전 관제 타워 네비게이터
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      31개 전 라우트
                    </Badge>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    URL 누락 없이 원하는 관리자 페이지로 1초 만에 즉시 이동합니다.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Search Input */}
            <div className="border-b border-border/60 px-6 py-3 bg-card/60">
              <div className="relative flex items-center">
                <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="메뉴명, 주소(/admin/...), 설명 검색 (예: 국고, 시나리오, 크롤러, 2FA)..."
                  className="w-full rounded-xl border border-input bg-background/80 pl-9 pr-4 py-2 text-xs font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Body - Scrollable Route List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {grouped.size === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  검색 결과와 일치하는 관리자 라우트가 없습니다.
                </div>
              ) : (
                Array.from(grouped.entries()).map(([cat, routes]) => (
                  <div key={cat} className="space-y-2.5">
                    <h3 className="text-xs font-black text-muted-foreground/80 tracking-wider uppercase flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-primary/60 inline-block" />
                      {cat}
                      <span className="text-[10px] font-normal text-muted-foreground/60">
                        ({routes.length})
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {routes.map((r) => {
                        const Icon = r.icon;
                        const isCurrent = pathname === r.href;
                        return (
                          <Link
                            key={r.href}
                            href={r.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'group flex items-start gap-3 rounded-xl border p-3 transition-all outline-none',
                              isCurrent
                                ? 'border-primary/50 bg-primary/10 text-primary shadow-xs'
                                : 'border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/60 text-foreground',
                            )}
                          >
                            <span
                              className={cn(
                                'flex size-7 shrink-0 items-center justify-center rounded-lg border transition-colors mt-0.5',
                                isCurrent
                                  ? 'border-primary/30 bg-primary/20 text-primary'
                                  : 'border-border/80 bg-background text-muted-foreground group-hover:text-foreground group-hover:border-primary/40',
                              )}
                            >
                              <Icon className="size-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                                  {r.label}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground/60 truncate">
                                  {r.href}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                {r.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border/80 px-6 py-3 bg-muted/20 text-[11px] text-muted-foreground">
              <span>총 31개 관리자 주소 완벽 바인딩</span>
              <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)} className="h-7 text-xs">
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
