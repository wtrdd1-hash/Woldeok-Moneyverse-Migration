'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export function SpacesView({
  spaces,
  cityProjects,
}: {
  readonly spaces: UserSpace[];
  readonly cityProjects: CityProject[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'spaces' | 'city'>('spaces');

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
          🛋️ 내 개인 공간 ({spaces.length})
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
          🏙️ 공공 도시 프로젝트 ({cityProjects.length})
        </button>
      </div>

      {/* 1. 내 개인 공간 탭 */}
      {activeTab === 'spaces' && (
        <div className="space-y-8">
          {/* 보유 공간 목록 */}
          <div className="space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <span>🏠</span>
              <span>보유 중인 나만의 공간</span>
            </h3>

            {spaces.length === 0 ? (
              <div className="text-center py-12 bg-card border border-dashed border-border rounded-xl space-y-2">
                <span className="text-3xl">📦</span>
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
                      <span className="text-emerald-500 font-semibold">입주 완료 ✨</span>
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
                <span>🏢</span>
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
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
            🏙️ <strong>공공 도시 프로젝트 크라우드펀딩:</strong> 머니버스 시민들이 WLD를 공동 출자하여 도시 공공 시설과 랜드마크를 완성합니다. 기여된 WLD는 즉시 전액 소각(SINK_PROJECT_DONATION)되며, 도시 역사와 공공 명예로 영구 보존됩니다.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cityProjects.map((p) => {
              const current = Number.parseInt(p.current_wld, 10);
              const target = Number.parseInt(p.target_wld, 10);
              const isCompleted = p.status === 'completed';

              return (
                <div
                  key={p.id}
                  className={`bg-card border rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between ${
                    isCompleted ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {p.code}
                        </span>
                        <h4 className="font-bold text-base mt-1">{p.title}</h4>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {isCompleted ? '건립 완공 🏛️' : '모금 진행 중'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>진행도: {p.progress_percent}%</span>
                        <span>
                          {current.toLocaleString()} / {target.toLocaleString()} WLD
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                          style={{ width: `${p.progress_percent}%` }}
                        />
                      </div>
                    </div>

                    {!isCompleted ? (
                      <button
                        type="button"
                        onClick={() => setSelectedCityProj(p)}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 rounded-lg text-xs transition-colors shadow-sm"
                      >
                        도시 프로젝트 WLD 기여 (소각)
                      </button>
                    ) : (
                      <div className="text-center text-xs text-emerald-500 font-semibold py-1">
                        시민 협동으로 완공된 자랑스러운 도시 랜드마크입니다.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 공간 구매 모달 */}
      {buyingType && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold">개인 공간 분양 신청</h3>
            <p className="text-xs text-muted-foreground">
              [{buyingType.name}] 분양 비용: <strong className="text-primary font-mono">{buyingType.price.toLocaleString()} WLD</strong>
            </p>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-xs text-amber-500 font-medium">
              🔥 분양 대금은 즉시 영구 소각(SINK_HOUSING_PURCHASE)되며 게임 밸런스에 영향을 주지 않는 순수한 정체성 공간으로 귀속됩니다.
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
              🔥 출자된 WLD는 공공 기여로 영구 소각(SINK_PROJECT_DONATION)되며, 도시 랜드마크 기록에 등재됩니다.
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
