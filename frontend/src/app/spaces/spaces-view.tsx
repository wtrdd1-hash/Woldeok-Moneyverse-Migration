'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CityProjectsView } from './city-projects-view';

export interface UserSpace {
  readonly id: string;
  readonly space_type: string;
  readonly name: string;
  readonly privacy: string;
  readonly created_at: string;
}

export interface CityProject {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly target_wld: string;
  readonly current_wld: string;
  readonly status: string;
  readonly stage: number;
  readonly progress_percent: number;
}

const SPACE_CATALOG = [
  { type: 'SPACE_ROOM_STARTER', name: '스타터 룸', price: 5000, desc: '첫 발을 내딛는 회원을 위한 아늑한 기본 원룸' },
  { type: 'SPACE_STUDIO', name: '스튜디오', price: 25000, desc: '다채로운 가구와 개인 장식을 연출할 수 있는 복층 스튜디오' },
  { type: 'SPACE_GALLERY', name: '개인 갤러리', price: 75000, desc: '수집한 아이템과 업적 트로피를 전시하는 쇼룸' },
  { type: 'SPACE_OFFICE', name: '개인 오피스', price: 100000, desc: '고급스러운 집무실과 개인 서재가 완비된 프라이빗 오피스' },
  { type: 'SPACE_PENTHOUSE', name: '펜트하우스', price: 250000, desc: '도시 스카이라인이 내려다보이는 럭셔리 최상층 공간' },
  { type: 'SPACE_HQ', name: '기업 본사 HQ', price: 1500000, desc: '머니버스 상위 자산가를 위한 거대 기업 본사 사옥' },
];

export interface SpaceTaxStatus {
  readonly spaceId: string;
  readonly spaceType: string;
  readonly spaceName: string;
  readonly dailyTaxWld: number;
  readonly taxPaidUntil: string | null;
  readonly isDelinquent: boolean;
  readonly overdueDays: number;
  readonly delinquentWld: number;
  readonly gracePeriodEnd: string | null;
  readonly isForeclosureReady: boolean;
  readonly estimatedForeclosurePrice: number;
}

export interface SpaceDelinquency {
  readonly spaceId: string;
  readonly spaceType: string;
  readonly spaceName: string;
  readonly ownerDisplayName: string;
  readonly overdueDays: number;
  readonly delinquentWld: number;
  readonly gracePeriodEnd: string;
  readonly isForeclosureReady: boolean;
  readonly estimatedForeclosurePrice: number;
}

const DAILY_TAX_MAP: Record<string, number> = {
  SPACE_ROOM_STARTER: 10,
  SPACE_STUDIO: 50,
  SPACE_GALLERY: 150,
  SPACE_OFFICE: 250,
  SPACE_PENTHOUSE: 600,
  SPACE_HQ: 2500,
};

export function SpacesView({
  spaces,
  cityProjects,
}: {
  readonly spaces: UserSpace[];
  readonly cityProjects: CityProject[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'spaces' | 'city' | 'tax'>('spaces');

  // 세무 구청 상태
  const [delinquencies, setDelinquencies] = useState<SpaceDelinquency[]>([]);
  const [isLoadingDelinquencies, setIsLoadingDelinquencies] = useState(false);
  const [taxStatuses, setTaxStatuses] = useState<Record<string, SpaceTaxStatus>>({});
  const [isLoadingTaxStatuses, setIsLoadingTaxStatuses] = useState(false);
  const [payingSpaceId, setPayingSpaceId] = useState<string | null>(null);
  const [taxFeedback, setTaxFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 공간 구매 모달 상태
  const [buyingType, setBuyingType] = useState<typeof SPACE_CATALOG[0] | null>(null);
  const [customName, setCustomName] = useState('');
  const [isBuying, setIsBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  // 도시 프로젝트 기여 상태
  const [selectedCityProj, setSelectedCityProj] = useState<CityProject | null>(null);
  const [cityAmount, setCityAmount] = useState('5000');
  const [isContributing, setIsContributing] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);

  const loadDelinquencies = useCallback(async () => {
    setIsLoadingDelinquencies(true);
    try {
      const res = await fetch('/api/v1/spaces/tax/delinquencies');
      if (res.ok) {
        const data = await res.json();
        setDelinquencies(data.delinquencies ?? []);
      }
    } catch {
      // 무시
    } finally {
      setIsLoadingDelinquencies(false);
    }
  }, []);

  const loadTaxStatuses = useCallback(async () => {
    if (spaces.length === 0) return;
    setIsLoadingTaxStatuses(true);
    try {
      const results = await Promise.all(
        spaces.map(async (s) => {
          try {
            const res = await fetch(`/api/v1/spaces/${s.id}/tax/status`);
            if (res.ok) {
              const data = await res.json();
              return { id: s.id, status: data.taxStatus as SpaceTaxStatus };
            }
          } catch {
            // 개별 실패 무시
          }
          return null;
        }),
      );
      const nextMap: Record<string, SpaceTaxStatus> = {};
      for (const r of results) {
        if (r && r.status) {
          nextMap[r.id] = r.status;
        }
      }
      setTaxStatuses(nextMap);
    } finally {
      setIsLoadingTaxStatuses(false);
    }
  }, [spaces]);

  useEffect(() => {
    if (activeTab === 'tax') {
      void loadDelinquencies();
      void loadTaxStatuses();
    }
  }, [activeTab, loadDelinquencies, loadTaxStatuses]);

  const handlePayTax = async (space: UserSpace, days: number) => {
    const dailyTax = DAILY_TAX_MAP[space.space_type] ?? 10;
    const totalWld = dailyTax * days;

    const confirmed = window.confirm(
      `[${space.name}] 공간의 ${days}일치 부동산세 ${totalWld.toLocaleString()} WLD를 납부하시겠습니까?\n납부된 WLD는 100% 영구 소각(SINK_PROPERTY_TAX) 처리됩니다.`,
    );
    if (!confirmed) return;

    setPayingSpaceId(space.id);
    setTaxFeedback(null);
    try {
      const res = await fetch(`/api/v1/spaces/${space.id}/tax/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || '부동산세 납부에 실패했습니다.');
      }

      setTaxFeedback({
        type: 'success',
        message: `[${space.name}] ${days}일치 부동산세 ${totalWld.toLocaleString()} WLD 납부 및 소각 완료! (영수증 ID: ${data.receipt?.receiptId ?? '완료'})`,
      });
      // 세무 상태 다시 로드
      await loadTaxStatuses();
      router.refresh();
    } catch (err: unknown) {
      setTaxFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPayingSpaceId(null);
    }
  };

  const handlePurchaseSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyingType) return;

    const confirmed = window.confirm(
      `[${buyingType.name}] 분양을 위해 ${buyingType.price.toLocaleString()} WLD가 영구 소각(SINK_HOUSING_PURCHASE)됩니다.\n계속 진행하시겠습니까?`,
    );
    if (!confirmed) return;

    setIsBuying(true);
    setBuyError(null);
    try {
      const res = await fetch('/api/v1/spaces/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceType: buyingType.type,
          name: customName.trim() || buyingType.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '공간 구매에 실패했습니다.');

      setBuyingType(null);
      setCustomName('');
      router.refresh();
    } catch (err: unknown) {
      setBuyError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsBuying(false);
    }
  };

  const handleCityContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityProj) return;
    const amount = Number.parseInt(cityAmount, 10);
    if (Number.isNaN(amount) || amount <= 0) {
      setCityError('올바른 WLD 금액을 입력하세요.');
      return;
    }

    const confirmed = window.confirm(
      `[${selectedCityProj.title}]에 ${amount.toLocaleString()} WLD를 공공 기여(영구 소각 SINK_PROJECT_DONATION)하시겠습니까?\n도시 인프라 발전과 공공 명예 기록으로 영구 보존됩니다.`,
    );
    if (!confirmed) return;

    setIsContributing(true);
    setCityError(null);
    try {
      const res = await fetch(`/api/v1/spaces/city/projects/${selectedCityProj.id}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountWld: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '도시 기여에 실패했습니다.');

      setSelectedCityProj(null);
      router.refresh();
    } catch (err: unknown) {
      setCityError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsContributing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('spaces')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'spaces'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          내 개인 공간 ({spaces.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('city')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'city'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          공공 도시 프로젝트 ({cityProjects.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tax')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'tax'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          🏛️ 가상 세무 구청 (부동산세 & 공매)
        </button>
      </div>

      {/* 1. 내 개인 공간 탭 */}
      {activeTab === 'spaces' && (
        <div className="space-y-8">
          {/* 보유 공간 목록 */}
          <div className="space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              
              <span>보유 중인 나만의 공간</span>
            </h3>

            {spaces.length === 0 ? (
              <div className="text-center py-12 bg-card border border-dashed border-border rounded-xl space-y-2">
                
                <p className="text-sm font-medium text-muted-foreground">
                  아직 분양받은 개인 공간이 없습니다.
                </p>
                <p className="text-xs text-muted-foreground">
                  아래 카탈로그에서 스타터 룸부터 둘러보고 나만의 프라이빗 공간을 마련해 보세요!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spaces.map((s) => (
                  <div key={s.id} className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-base">{s.name}</h4>
                        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {s.space_type}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {s.privacy === 'public' ? '공개' : '비공개'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>입주: {new Date(s.created_at).toLocaleDateString('ko-KR')}</span>
                      <span className="text-emerald-500 font-semibold">입주 완료</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 신규 분양 카탈로그 */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                
                <span>신규 개인 공간 분양 센터</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Pay-to-Win 능력치가 없으며, WLD 영구 소각(SINK_HOUSING_PURCHASE)을 통해 나만의 영구 거점을 획득합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SPACE_CATALOG.map((cat) => (
                <div key={cat.type} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-base">{cat.name}</h4>
                      <span className="font-mono text-sm font-bold text-primary">
                        {cat.price.toLocaleString()} WLD
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cat.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setBuyingType(cat);
                      setCustomName(cat.name);
                    }}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-2 rounded-lg text-xs transition-colors shadow-sm"
                  >
                    분양 신청하기
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

            {/* 2. 공공 도시 프로젝트 탭 */}
      {activeTab === 'city' && (
        <CityProjectsView projects={cityProjects} />
      )}

      {/* 3. 가상 세무 구청 탭 */}
      {activeTab === 'tax' && (
        <div className="space-y-8">
          {/* 상단 정책 안내 배너 */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🏛️</span>
              <h3 className="font-bold text-base">머니버스 세무 구청 & 체납 공매 관리국</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              가상 부동산의 건전한 순환과 통화량 조절을 위해 모든 공간 소유자에게 공간 유형별 일일 보유세가 부과됩니다.
              납부된 부동산세는 전액 <strong className="text-primary font-semibold">100% 영구 소각(SINK_PROPERTY_TAX)</strong>되며,
              세금 미납 시 7일간의 법정 유예 기간 후 시청 강제 공매 매물로 전환됩니다.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-muted-foreground">
              <span className="bg-muted px-2 py-0.5 rounded">스타터 룸: 10 WLD/일</span>
              <span className="bg-muted px-2 py-0.5 rounded">스튜디오: 50 WLD/일</span>
              <span className="bg-muted px-2 py-0.5 rounded">갤러리: 150 WLD/일</span>
              <span className="bg-muted px-2 py-0.5 rounded">오피스: 250 WLD/일</span>
              <span className="bg-muted px-2 py-0.5 rounded">펜트하우스: 600 WLD/일</span>
              <span className="bg-muted px-2 py-0.5 rounded">기업 HQ: 2,500 WLD/일</span>
            </div>
          </div>

          {/* 피드백 메시지 */}
          {taxFeedback && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border flex items-center justify-between ${
                taxFeedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }`}
            >
              <span>{taxFeedback.message}</span>
              <button
                type="button"
                onClick={() => setTaxFeedback(null)}
                className="text-[11px] underline ml-2 cursor-pointer"
              >
                닫기
              </button>
            </div>
          )}

          {/* 내 보유 공간 세무 현황 및 납부 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>내 보유 공간 부동산세 납부</span>
              </h3>
              <button
                type="button"
                onClick={() => void loadTaxStatuses()}
                disabled={isLoadingTaxStatuses}
                className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
              >
                {isLoadingTaxStatuses ? '세무 조회 중...' : '새로고침'}
              </button>
            </div>

            {spaces.length === 0 ? (
              <div className="text-center py-10 bg-card border border-dashed border-border rounded-xl space-y-1">
                <p className="text-sm font-medium text-muted-foreground">보유 중인 공간이 없습니다.</p>
                <p className="text-xs text-muted-foreground">개인 공간을 분양받으면 이곳에서 일일 보유세를 납부하고 관리할 수 있습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spaces.map((s) => {
                  const status = taxStatuses[s.id];
                  const dailyTax = DAILY_TAX_MAP[s.space_type] ?? 10;
                  const isPaying = payingSpaceId === s.id;

                  return (
                    <div key={s.id} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-base">{s.name}</h4>
                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {s.space_type}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-muted-foreground">
                            {dailyTax.toLocaleString()} WLD / 일
                          </span>
                        </div>

                        {status ? (
                          <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">납부 완납 기한:</span>
                              <span className="font-medium font-mono">
                                {status.taxPaidUntil
                                  ? new Date(status.taxPaidUntil).toLocaleDateString('ko-KR')
                                  : '미납 (체납 발생)'}
                              </span>
                            </div>
                            {status.isDelinquent && (
                              <div className="pt-1 border-t border-border/50 text-destructive flex justify-between font-semibold">
                                <span>체납 ({status.overdueDays}일 연체):</span>
                                <span>{status.delinquentWld.toLocaleString()} WLD</span>
                              </div>
                            )}
                            {status.isDelinquent && status.gracePeriodEnd && (
                              <div className="text-[11px] text-amber-500 flex justify-between">
                                <span>공매 유예 마감:</span>
                                <span>{new Date(status.gracePeriodEnd).toLocaleDateString('ko-KR')}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground py-2">
                            {isLoadingTaxStatuses ? '세무 상태 확인 중...' : '세무 상태를 로드할 수 없습니다.'}
                          </div>
                        )}
                      </div>

                      {/* 납부 버튼 그룹 */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <span className="text-[11px] text-muted-foreground block font-medium">부동산세 자진 납부 (소각):</span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            disabled={isPaying}
                            onClick={() => void handlePayTax(s, 1)}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors text-center cursor-pointer disabled:opacity-50"
                          >
                            1일 ({dailyTax.toLocaleString()} WLD)
                          </button>
                          <button
                            type="button"
                            disabled={isPaying}
                            onClick={() => void handlePayTax(s, 7)}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors text-center cursor-pointer disabled:opacity-50"
                          >
                            7일 ({(dailyTax * 7).toLocaleString()} WLD)
                          </button>
                          <button
                            type="button"
                            disabled={isPaying}
                            onClick={() => void handlePayTax(s, 30)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors text-center cursor-pointer disabled:opacity-50"
                          >
                            30일 ({(dailyTax * 30).toLocaleString()} WLD)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 실시간 체납 공매 매물 목록 */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span>체납 공매 대상 공간 목록 (Foreclosures)</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  부동산세 7일 이상 체납으로 법정 유예 기간이 경과하여 시청 공매에 회부된 매물 목록입니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadDelinquencies()}
                disabled={isLoadingDelinquencies}
                className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
              >
                {isLoadingDelinquencies ? '새로고침 중...' : '공매 목록 새로고침'}
              </button>
            </div>

            {delinquencies.length === 0 ? (
              <div className="text-center py-12 bg-card border border-dashed border-border rounded-xl space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  현재 체납 또는 강제 공매 회부된 공간 매물이 없습니다.
                </p>
                <p className="text-xs text-muted-foreground">
                  모든 머니버스 시민들이 성실히 납세 의무를 이행하고 있습니다.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {delinquencies.map((d) => (
                  <div key={d.spaceId} className="bg-card border border-destructive/30 rounded-xl p-5 space-y-3 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-base">{d.spaceName}</h4>
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {d.spaceType}
                        </span>
                      </div>
                      <span className="text-[11px] text-destructive bg-destructive/10 px-2 py-0.5 rounded font-semibold">
                        {d.isForeclosureReady ? '강제 공매 대기' : '유예 기간 중'}
                      </span>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">원소유자:</span>
                        <span className="font-semibold">{d.ownerDisplayName}</span>
                      </div>
                      <div className="flex justify-between text-destructive">
                        <span>체납 기간 / 체납액:</span>
                        <span className="font-bold">{d.overdueDays}일 / {d.delinquentWld.toLocaleString()} WLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">추정 최저 입찰가:</span>
                        <span className="font-mono font-bold text-primary">
                          {d.estimatedForeclosurePrice.toLocaleString()} WLD
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-amber-500 pt-1 border-t border-border/40">
                        <span>유예 만료일:</span>
                        <span>{new Date(d.gracePeriodEnd).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {buyingType && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold">개인 공간 분양 신청</h3>
            <p className="text-xs text-muted-foreground">
              [{buyingType.name}] 분양 비용: <strong className="text-primary font-mono">{buyingType.price.toLocaleString()} WLD</strong>
            </p>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-xs text-amber-500 font-medium">
              분양 대금은 즉시 영구 소각(SINK_HOUSING_PURCHASE)되며 게임 밸런스에 영향을 주지 않는 순수한 정체성 공간으로 귀속됩니다.
            </div>

            {buyError && (
              <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                {buyError}
              </div>
            )}

            <form onSubmit={handlePurchaseSpace} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">공간 명칭</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="나만의 공간 이름을 입력하세요"
                  maxLength={50}
                  className="w-full bg-muted border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBuyingType(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isBuying}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm"
                >
                  {isBuying ? '소각 및 분양 중...' : '소각 결제 및 분양 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 도시 프로젝트 기여 모달 */}
      {selectedCityProj && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold">공공 도시 프로젝트 기여</h3>
            <p className="text-xs text-muted-foreground">
              [{selectedCityProj.title}] 프로젝트에 출자할 WLD 금액을 입력하세요.
            </p>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-xs text-amber-500 font-medium">
              출자된 WLD는 공공 기여로 영구 소각(SINK_PROJECT_DONATION)되며, 도시 랜드마크 기록에 등재됩니다.
            </div>

            {cityError && (
              <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                {cityError}
              </div>
            )}

            <form onSubmit={handleCityContribution} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">기여 금액 (WLD)</label>
                <input
                  type="number"
                  min={1}
                  value={cityAmount}
                  onChange={(e) => setCityAmount(e.target.value)}
                  className="w-full bg-muted border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCityProj(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isContributing}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm"
                >
                  {isContributing ? '처리 중...' : '소각 기여 확인'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
