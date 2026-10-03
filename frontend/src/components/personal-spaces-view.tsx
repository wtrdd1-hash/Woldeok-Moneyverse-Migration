'use client';

import { useState, useEffect } from 'react';
import {
  Home,
  Layout,
  Sparkles,
  Briefcase,
  Building2,
  Landmark,
  Crown,
  MapPin,
  TrendingUp,
  Coins,
  ShieldCheck,
  Plus,
  Palette,
  CheckCircle2,
  Layers,
  Building,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';
import {
  PERSONAL_SPACE_SKUS,
  CITY_DISTRICTS,
  SPACE_THEMES,
  UserPersonalSpace,
  loadUserSpaces,
  saveUserSpaces,
  getSpaceConfig,
  getDistrictConfig,
  calculateRoomExpansionCost,
  calculateGalleryWingCost,
  calculateEstimatedYield,
} from '@/lib/personal-spaces';
import {
  playBetChipSound,
  playCoinCollectSound,
  playWinSound,
} from '@/lib/audio-effects';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Layout,
  Sparkles,
  Briefcase,
  Building2,
  Landmark,
  Crown,
  Building,
};

export function PersonalSpacesView() {
  const [spaces, setSpaces] = useState<readonly UserPersonalSpace[]>([]);
  const [activeSpaceIndex, setActiveSpaceIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'interior' | 'my_spaces' | 'real_estate'>('interior');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isRemodelModalOpen, setIsRemodelModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedBuySkuId, setSelectedBuySkuId] = useState<string>('SPACE_STUDIO');
  const [selectedBuyDistrictId, setSelectedBuyDistrictId] = useState<string>('DISTRICT_GANGNAM');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setSpaces(loadUserSpaces());
  }, []);

  const currentSpace = spaces[activeSpaceIndex] || spaces[0];
  const currentSku = currentSpace ? getSpaceConfig(currentSpace.spaceId) : PERSONAL_SPACE_SKUS[0]!;
  const currentDistrict = currentSpace ? getDistrictConfig(currentSpace.districtId) : CITY_DISTRICTS[0]!;
  const currentTheme = currentSpace ? SPACE_THEMES[currentSpace.activeTheme] : SPACE_THEMES.minimal;

  // 임대수익 수령 핸들러
  const handleCollectYield = () => {
    if (!currentSpace) return;
    playCoinCollectSound();

    const currentYield = calculateEstimatedYield(currentSpace);
    if (BigInt(currentYield) <= 0n) {
      setStatusMessage('수령할 누적 임대료가 없습니다.');
      return;
    }

    const updated = spaces.map((s, idx) => {
      if (idx === activeSpaceIndex) {
        return {
          ...s,
          lastRentCollectedAt: new Date().toISOString(),
          accumulatedRentYield: '0',
        };
      }
      return s;
    });

    setSpaces(updated);
    saveUserSpaces(updated);
    setStatusMessage(`${groupDigits(currentYield)} WLD의 부동산 임대료가 성공적으로 정산 및 입금되었습니다.`);
  };

  // 방 확장 업그레이드 핸들러
  const handleExpandRoom = () => {
    if (!currentSpace) return;
    playWinSound();

    const nextTier = currentSpace.roomTier + 1;
    const cost = calculateRoomExpansionCost(currentSpace.roomTier);

    const updated = spaces.map((s, idx) => {
      if (idx === activeSpaceIndex) {
        return {
          ...s,
          roomTier: nextTier,
        };
      }
      return s;
    });

    setSpaces(updated);
    saveUserSpaces(updated);
    setIsUpgradeModalOpen(false);
    setStatusMessage(`${currentSpace.customName}의 방이 확장되었습니다! (현재 Level ${nextTier}, 차감: ${groupDigits(cost)} WLD)`);
  };

  // 테마 리모델링 핸들러
  const handleRemodelTheme = (themeKey: UserPersonalSpace['activeTheme']) => {
    if (!currentSpace) return;
    playBetChipSound();

    const updated = spaces.map((s, idx) => {
      if (idx === activeSpaceIndex) {
        return {
          ...s,
          activeTheme: themeKey,
        };
      }
      return s;
    });

    setSpaces(updated);
    saveUserSpaces(updated);
    setIsRemodelModalOpen(false);
    setStatusMessage(`인테리어 테마가 [${SPACE_THEMES[themeKey].name}]으로 리모델링되었습니다.`);
  };

  // 신규 가상 부동산 공간 구매 핸들러
  const handlePurchaseNewSpace = () => {
    const sku = getSpaceConfig(selectedBuySkuId);
    const district = getDistrictConfig(selectedBuyDistrictId);
    playWinSound();

    const newSpace: UserPersonalSpace = {
      instanceId: `space-${Date.now()}`,
      spaceId: sku.id,
      districtId: district.id,
      customName: `${district.name} ${sku.name}`,
      roomTier: 0,
      galleryWingTier: 0,
      activeTheme: district.primeTheme as UserPersonalSpace['activeTheme'],
      exhibits: ['머니버스 공인 소유권 등기 증서'],
      purchasedAt: new Date().toISOString(),
      lastRentCollectedAt: new Date().toISOString(),
      accumulatedRentYield: '0',
    };

    const updated = [...spaces, newSpace];
    setSpaces(updated);
    saveUserSpaces(updated);
    setActiveSpaceIndex(updated.length - 1);
    setIsBuyModalOpen(false);
    setStatusMessage(`축하합니다! ${district.name} 소재 [${sku.name}]을 성공적으로 매입하였습니다.`);
  };

  return (
    <div className="space-y-6">
      {/* 상태 알림 토스트 메시지 */}
      {statusMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-center text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStatusMessage(null)}
            className="h-6 px-2 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            닫기
          </Button>
        </div>
      )}

      {/* 상단 탭 내비게이션 */}
      <div className="flex rounded-xl border border-border/80 bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => {
            playBetChipSound();
            setActiveTab('interior');
          }}
          className={`flex-1 rounded-lg py-2.5 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'interior'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="size-4" />
          <span>룸 인테리어 뷰어</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playBetChipSound();
            setActiveTab('my_spaces');
          }}
          className={`flex-1 rounded-lg py-2.5 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'my_spaces'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="size-4" />
          <span>보유 공간 관리 ({spaces.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playBetChipSound();
            setActiveTab('real_estate');
          }}
          className={`flex-1 rounded-lg py-2.5 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'real_estate'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="size-4" />
          <span>가상 부동산 도시 랜드</span>
        </button>
      </div>

      {/* 1. 룸 인테리어 뷰어 탭 */}
      {activeTab === 'interior' && currentSpace && (
        <div className="space-y-6">
          <Card className={`border-2 ${currentTheme.borderClass} bg-gradient-to-b ${currentTheme.bgClass} shadow-xl text-white`}>
            <CardHeader className="border-b border-white/10 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-400/50 bg-amber-400/10 text-amber-300 text-xs font-bold">
                      {currentSku.badge}
                    </Badge>
                    <Badge variant="outline" className="border-white/20 bg-white/5 text-slate-300 text-xs font-mono">
                      <MapPin className="size-3 mr-1 text-rose-400" />
                      {currentDistrict.name}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-black text-white">
                    {currentSpace.customName}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      playBetChipSound();
                      setIsRemodelModalOpen(true);
                    }}
                    className="border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold gap-1"
                  >
                    <Palette className="size-3.5" />
                    <span>테마 리모델링</span>
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => {
                      playBetChipSound();
                      setIsUpgradeModalOpen(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold gap-1"
                  >
                    <Plus className="size-3.5" />
                    <span>방 확장 (Lv.{currentSpace.roomTier})</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              {/* 3D 룸 시각화 스테이지 */}
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/40 p-6 min-h-[220px] sm:min-h-[280px] flex flex-col justify-between shadow-inner">
                {/* 배경 앰비언트 글로우 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* 상단 룸 스펙 지표 바 */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-300">
                      방 면적: <strong className="text-amber-400 font-bold">{10 + currentSpace.roomTier * 6}평</strong>
                    </span>
                    <span className="font-mono text-slate-300">
                      전시 슬롯: <strong className="text-cyan-400 font-bold">{currentSpace.exhibits.length} / {currentSku.maxExhibits + currentSpace.galleryWingTier * 2}개</strong>
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-slate-200 text-[11px] font-mono">
                    {currentTheme.name}
                  </Badge>
                </div>

                {/* 중앙 인테리어 가상 전시 그리드 */}
                <div className="relative z-10 my-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {currentSpace.exhibits.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-md p-3 text-center space-y-1 shadow-md hover:scale-105 transition-transform"
                    >
                      <Sparkles className="size-5 text-amber-400 mx-auto" />
                      <p className="text-[11px] font-bold text-slate-100 truncate">{item}</p>
                      <p className="text-[9px] text-slate-400">인증 완료 전시품</p>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, currentSku.maxExhibits - currentSpace.exhibits.length) }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-3 text-center flex flex-col items-center justify-center text-slate-400 text-[10px]"
                    >
                      <Plus className="size-4 opacity-50 mb-1" />
                      <span>빈 전시 슬롯</span>
                    </div>
                  ))}
                </div>

                {/* 하단 임대수익 정산 컨트롤 바 */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="size-4 text-emerald-400" />
                    <span>누적 부동산 임대료:</span>
                    <strong className="font-mono text-base text-emerald-400 font-black">
                      +{groupDigits(calculateEstimatedYield(currentSpace))} WLD
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      (연 {((currentSku.baseRentYieldAnnual * currentDistrict.yieldMultiplier * (1 + currentSpace.roomTier * 0.15)) * 100).toFixed(1)}%)
                    </span>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCollectYield}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1 shadow-md"
                  >
                    <Coins className="size-3.5" />
                    <span>임대 수익 원터치 수령</span>
                  </Button>
                </div>
              </div>

              {/* 공간 상세 설명 */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Info className="size-3.5 text-amber-400" />
                  <span>공간 특징 및 세계관 소개</span>
                </p>
                <p className="leading-relaxed [word-break:keep-all]">
                  {currentSku.description} {currentDistrict.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. 보유 공간 관리 탭 */}
      {activeTab === 'my_spaces' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {spaces.map((sp, idx) => {
            const sku = getSpaceConfig(sp.spaceId);
            const dist = getDistrictConfig(sp.districtId);
            const isSelected = idx === activeSpaceIndex;

            return (
              <Card
                key={sp.instanceId}
                className={`transition-all border-2 ${
                  isSelected ? 'border-amber-500 bg-amber-500/5 shadow-md' : 'border-border/80 hover:border-amber-500/40'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                      {sku.name}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">{dist.name}</span>
                  </div>
                  <CardTitle className="text-lg font-bold">{sp.customName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted-foreground">
                    <div>방 레벨: <strong className="text-foreground">Lv.{sp.roomTier}</strong></div>
                    <div>전시품: <strong className="text-foreground">{sp.exhibits.length}개</strong></div>
                    <div>임대수익: <strong className="text-emerald-600 dark:text-emerald-400">+{groupDigits(calculateEstimatedYield(sp))} WLD</strong></div>
                    <div>테마: <strong className="text-foreground">{SPACE_THEMES[sp.activeTheme].name}</strong></div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        playBetChipSound();
                        setActiveSpaceIndex(idx);
                        setActiveTab('interior');
                      }}
                      className="w-full text-xs font-bold"
                    >
                      {isSelected ? '현재 룸 열기' : '이 공간으로 전환'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 3. 가상 부동산 도시 랜드 탭 */}
      {activeTab === 'real_estate' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Landmark className="size-5 text-amber-500" />
                <span>머니버스 8대 메가시티 랜드마크</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                구역별 유동 인구 및 프리미엄 테마에 따라 차등화된 임대 수익률이 적용됩니다.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => {
                playBetChipSound();
                setIsBuyModalOpen(true);
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs gap-1.5 shadow-md"
            >
              <Plus className="size-4" />
              <span>신규 부동산 매입 분양</span>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CITY_DISTRICTS.map((district) => {
              const occupancyPct = Math.round((district.occupiedParcels / district.totalParcels) * 100);

              return (
                <Card key={district.id} className="border-border/80 hover:border-amber-500/40 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {district.region}
                      </Badge>
                      <span className="text-xs font-bold text-amber-500 font-mono">
                        수익률 x{district.yieldMultiplier}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                      <Building2 className="size-4 text-indigo-500" />
                      <span>{district.name}</span>
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {district.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                        <span>분양 점유율</span>
                        <span>{occupancyPct}% ({district.occupiedParcels}/{district.totalParcels})</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all"
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBuyDistrictId(district.id);
                        setIsBuyModalOpen(true);
                        playBetChipSound();
                      }}
                      className="w-full text-xs font-bold border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    >
                      이 구역 공간 분양받기
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 방 확장 업그레이드 모달 */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Plus className="size-5 text-amber-500" />
              <span>방 면적 및 전시 슬롯 증설</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              공식 증설 공식(8,000 x 1.35^n)에 따라 면적과 임대수익률이 동시 증가합니다.
            </DialogDescription>
          </DialogHeader>

          {currentSpace && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
                <div className="flex justify-between font-mono">
                  <span>현재 레벨:</span>
                  <span className="font-bold">Lv.{currentSpace.roomTier}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>확장 후 레벨:</span>
                  <span className="font-bold text-amber-500">Lv.{currentSpace.roomTier + 1}</span>
                </div>
                <div className="flex justify-between font-mono border-t border-border/80 pt-2 text-sm font-bold">
                  <span>소요 비용:</span>
                  <span className="text-amber-500">{groupDigits(calculateRoomExpansionCost(currentSpace.roomTier))} WLD</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUpgradeModalOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleExpandRoom}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
            >
              확장 승인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 테마 리모델링 모달 */}
      <Dialog open={isRemodelModalOpen} onOpenChange={setIsRemodelModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Palette className="size-5 text-amber-500" />
              <span>인테리어 테마 리모델링</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              원하는 무드의 하이엔드 테마를 선택하여 공간의 분위기를 전환하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2 sm:grid-cols-2">
            {(Object.keys(SPACE_THEMES) as Array<UserPersonalSpace['activeTheme']>).map((key) => {
              const theme = SPACE_THEMES[key];
              const isCurrent = currentSpace?.activeTheme === key;

              return (
                <div
                  key={key}
                  onClick={() => handleRemodelTheme(key)}
                  className={`cursor-pointer rounded-xl border-2 p-3 space-y-1.5 transition-all ${
                    isCurrent
                      ? 'border-amber-500 bg-amber-500/10 shadow-md'
                      : 'border-border/80 hover:border-amber-500/40 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{theme.name}</span>
                    {isCurrent && <CheckCircle2 className="size-4 text-amber-500" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {theme.description}
                  </p>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* 신규 공간 매입 분양 모달 */}
      <Dialog open={isBuyModalOpen} onOpenChange={setIsBuyModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Landmark className="size-5 text-amber-500" />
              <span>가상 부동산 공간 분양 매입</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              원하는 공간 유형과 도시 구역을 선택하여 부동산 등기를 취득하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* 구역 선택 */}
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">도시 구역 선택</label>
              <div className="grid grid-cols-2 gap-1.5">
                {CITY_DISTRICTS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedBuyDistrictId(d.id);
                      playBetChipSound();
                    }}
                    className={`rounded-lg border p-2 text-left transition-all ${
                      selectedBuyDistrictId === d.id
                        ? 'border-amber-500 bg-amber-500/10 font-bold'
                        : 'border-border/80 hover:bg-muted/50'
                    }`}
                  >
                    <div className="truncate font-semibold">{d.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">수익률 x{d.yieldMultiplier}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 공간 SKU 선택 */}
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">공간 SKU 선택</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {PERSONAL_SPACE_SKUS.map((sku) => (
                  <button
                    key={sku.id}
                    type="button"
                    onClick={() => {
                      setSelectedBuySkuId(sku.id);
                      playBetChipSound();
                    }}
                    className={`rounded-lg border p-2 text-left transition-all ${
                      selectedBuySkuId === sku.id
                        ? 'border-amber-500 bg-amber-500/10 font-bold'
                        : 'border-border/80 hover:bg-muted/50'
                    }`}
                  >
                    <div className="truncate font-semibold">{sku.name}</div>
                    <div className="text-[10px] text-amber-500 font-mono font-bold">{groupDigits(sku.basePrice)} WLD</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBuyModalOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePurchaseNewSpace}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
            >
              {groupDigits(getSpaceConfig(selectedBuySkuId).basePrice)} WLD 매입 분양
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
