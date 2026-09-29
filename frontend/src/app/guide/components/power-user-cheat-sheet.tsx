'use client';

import {
  Zap,
  TrendingUp,
  Briefcase,
  Landmark,
  Smartphone,
  Keyboard,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TranslatedText as T } from '@/components/translated-text';

interface CheatCategory {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  icon: typeof Zap;
  accent: string;
  badge: string;
  tips: {
    title: string;
    description: string;
    tag?: string;
  }[];
}

const CHEAT_CATEGORIES: CheatCategory[] = [
  {
    id: 'stocks',
    title: '주식 거래소 쾌속 트레이딩',
    titleEn: 'Stock Exchange Fast Trading',
    subtitle: '호가창과 AI 감성 지표를 활용한 고수익 매매법',
    icon: TrendingUp,
    accent: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    badge: '투자 꿀팁',
    tips: [
      {
        title: '호가 잔량 클릭 시 주문가 자동 입력',
        description: '10-Depth 호가창의 가격 셀을 터치하면 우측 주문창에 해당 가격이 즉시 입력되어 빠른 주문이 가능합니다.',
        tag: '원터치 주문',
      },
      {
        title: 'AI 신문 호재 발생 직후 600ms 골든타임',
        description: 'AI 신문에 특정 기업 호재 기사가 보도되면 600ms 플래시 펄스 상승 랠리가 시작됩니다. 속보를 주시하세요.',
        tag: 'AI 속보',
      },
      {
        title: '스프레드가 넓을 때는 지정가(Limit) 주문',
        description: '시장가 주문 대신 호가 상단/하단에 지정가 주문을 깔아두면 슬리피지 수수료 손실을 0으로 방어할 수 있습니다.',
        tag: '비용 절감',
      },
    ],
  },
  {
    id: 'work',
    title: '직업 파밍 쿨타임 최적화',
    titleEn: 'Work Cooldown Optimization',
    subtitle: '하루 3번 1분 투자로 최대 일일 급여(4,000만 WLD) 달성',
    icon: Briefcase,
    accent: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    badge: '파밍 루틴',
    tips: [
      {
        title: '접속 직후 가장 먼저 작업 수주 버튼 클릭',
        description: '작업을 먼저 맡겨두면 다른 페이지를 둘러보거나 브라우저를 닫아도 서버에서 백그라운드 쿨타임이 진행됩니다.',
        tag: '시간 절약',
      },
      {
        title: '상점(덕마켓) 직업 전용 도구 착용',
        description: '아이템 상점에서 전문 직업 도구를 구매해 인벤토리에 보유하면 1회 작업당 추가 WLD 보너스가 가산됩니다.',
        tag: '수익 부스트',
      },
      {
        title: '숙련도 승급 시 즉시 상위 난이도 수주',
        description: '경험치 게이지가 100%에 도달하면 즉시 승급하고, 일일 배정 한도가 더 높은 상위 티어 작업을 수주하세요.',
        tag: '레벨업',
      },
    ],
  },
  {
    id: 'banking',
    title: '복리 이자 극대화 타이밍',
    titleEn: 'Compound Yield Timing',
    subtitle: '놀고 있는 지갑 잔액 0원으로 유지하는 스마트 금융 습관',
    icon: Landmark,
    accent: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    badge: '패시브 소득',
    tips: [
      {
        title: '일과 종료 전 잔액 전액 복리 예금 예치',
        description: '지갑에 남은 WLD는 매일 자정 전 복리 정기예금에 넣어두어야 당일 밤 자정에 일복리 0.5%가 정상 계산됩니다.',
        tag: '자정 정산',
      },
      {
        title: '주말 장기 미접속 시 7일 만기 국채 활용',
        description: '며칠간 접속이 어려울 때는 변동성이 없는 7일 가상 국채에 예치해 확정된 고수익 만기 이자를 챙기세요.',
        tag: '확정 수익',
      },
      {
        title: '신용도 관리로 비상 대출 한도 확보',
        description: '성실한 출석과 예금 거래 실적이 쌓이면 비상 대출 한도가 상향되어 급격한 주식 폭락장 시드 마련이 가능합니다.',
        tag: '신용 레버리지',
      },
    ],
  },
  {
    id: 'mobile',
    title: '모바일 핀테크 터치 제스처',
    titleEn: 'Mobile Gesture Guide',
    subtitle: '한 손 조작 최적화 44px 터치 타깃과 스와이프 내비게이션',
    icon: Smartphone,
    accent: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    badge: '모바일 UX',
    tips: [
      {
        title: '상단 GNB 4대 메가 카테고리 탭',
        description: '금융·투자, 경제·활동, 플레이·시즌, 커뮤니티 4대 탭으로 모든 서비스에 2터치 이내로 도달할 수 있습니다.',
        tag: '빠른 이동',
      },
      {
        title: '44px+ 터치 프리셋 칩 (100% 오타 방지)',
        description: '송금 및 주식 주문 시 25%, 50%, MAX 칩을 터치하여 키패드 타이핑 없이 손쉽게 수량을 지정하세요.',
        tag: '원터치 칩',
      },
      {
        title: '오프라인 네트워크 멱등성 보호',
        description: '지하철 등 음영 구역에서 연결이 끊겨도 안심하세요. 다시 연결되는 즉시 중복 결제 없이 안전하게 동기화됩니다.',
        tag: '오프라인 방어',
      },
    ],
  },
];

export function PowerUserCheatSheet() {
  return (
    <section
      aria-labelledby="cheatsheet-heading"
      className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-2 pb-6 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
            <Zap className="size-3.5" />
            <span>POWER USER CHEAT SHEET</span>
          </div>
          <h2 id="cheatsheet-heading" className="text-2xl font-black tracking-tight sm:text-3xl">
            <T korean="파워 유저를 위한 실전 꿀팁 & 치트시트" english="Power User Pro Tips & Cheat Sheet" />
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 [word-break:keep-all]">
            <T
              korean="자산 형성 속도를 2배로 앞당기는 상위 1% 랭커들의 실전 노하우와 모바일 조작 팁을 공개합니다."
              english="Accelerate your asset growth with practical workflows and mobile shortcuts used by top players."
            />
          </p>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto font-mono text-xs border-primary/40 bg-primary/5 text-primary">
          랭커 공인 실전 가이드
        </Badge>
      </div>

      <div className="grid gap-5 pt-6 md:grid-cols-2">
        {CHEAT_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.id} className="border border-border/70 bg-card/60 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`grid size-9 place-items-center rounded-xl border ${cat.accent}`}>
                      <Icon className="size-4.5" />
                    </span>
                    <div>
                      <CardTitle className="text-base font-bold">
                        <T korean={cat.title} english={cat.titleEn} />
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground [word-break:keep-all]">
                        {cat.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-border">
                    {cat.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {cat.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/50 bg-background/50 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                        <span>{tip.title}</span>
                      </div>
                      {tip.tag && (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          [{tip.tag}]
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed pl-5 [word-break:keep-all]">
                      {tip.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
