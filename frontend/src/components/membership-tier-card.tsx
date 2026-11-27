'use client';

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Check,
  Zap,
  Shield,
  Sparkles,
  EyeOff,
  Flame,
  Gift,
  BadgeCheck,
} from 'lucide-react';

interface MembershipTierCardProps {
  /** null = the balance could not be read; never treated as 0. */
  userBalance?: number | string | null;
  isPlusMember?: boolean;
  onSubscribe?: () => Promise<boolean | void> | void;
  onCancel?: () => Promise<boolean | void> | void;
}

export function MembershipTierCard({
  userBalance = 0,
  isPlusMember = false,
  onSubscribe,
  onCancel,
}: MembershipTierCardProps) {
  const [activeTier, setActiveTier] = useState<boolean>(isPlusMember);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setActiveTier(Boolean(isPlusMember));
  }, [isPlusMember]);

  const balanceKnown = userBalance !== null;
  const numericBalance = typeof userBalance === 'string' ? parseInt(userBalance, 10) || 0 : (userBalance ?? 0);
  const PLUS_PRICE = 10000; // 10,000 WLD / month

  const handleToggleSubscribe = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setFeedback(null);

    try {
      if (activeTier) {
        // Cancel
        if (onCancel) {
          const res = await onCancel();
          if (res === false) {
            setIsProcessing(false);
            return;
          }
        }
        setActiveTier(false);
        setFeedback('Moneyverse Plus 구독 취소 접수 완료. (만료일까지 모든 VIP 혜택 유지)');
      } else {
        // Subscribe
        if (!balanceKnown) {
          setFeedback('지금은 잔액을 확인할 수 없어요. 잠시 후 다시 시도해 주세요.');
          return;
        }
        if (numericBalance < PLUS_PRICE) {
          setFeedback(`잔액이 부족합니다. (필요: ${PLUS_PRICE.toLocaleString()} WLD / 보유: ${numericBalance.toLocaleString()} WLD)`);
          setIsProcessing(false);
          return;
        }

        if (onSubscribe) {
          const res = await onSubscribe();
          if (res === false) {
            setIsProcessing(false);
            return;
          }
        }
        setActiveTier(true);
        setFeedback('🎉 축하합니다! Moneyverse Plus VIP 멤버십이 활성화되었습니다! 10,000 WLD가 영구 소각되었습니다.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.';
      setFeedback(`처리 실패: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full rounded-lg border border-[var(--g1-line)] bg-[var(--g1-night-2)] p-6 text-[var(--g1-text)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--g1-line)] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md border border-[var(--g1-line)] bg-[var(--g1-plum)] text-[var(--g1-gold)]">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[var(--g1-ink)]">Moneyverse Plus 멤버십 티어</h2>
              <span className="rounded-md border border-[var(--g1-line)] px-2 py-0.5 text-xs font-medium text-[var(--g1-muted)]">
                VIP Tier 2.0
              </span>
            </div>
            <p className="text-xs text-[var(--g1-muted)]">
              게임 내 100% 가상재화(WLD)로 구독하는 프리미엄 혜택 패키지
            </p>
          </div>
        </div>

        {/* Current Status Badge */}
        <div className="flex items-center gap-2">
          {activeTier ? (
            <div className="flex items-center gap-1.5 rounded-md border border-[var(--g1-line)] px-3 py-1 text-xs font-medium text-[var(--g1-ink)]">
              <BadgeCheck className="h-4 w-4" />
              <span>Plus VIP 활성 중</span>
            </div>
          ) : (
            <div className="rounded-md border border-[var(--g1-line)] px-3 py-1 text-xs font-medium text-[var(--g1-muted)]">
              무료 (Free Core) 이용 중
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="mt-4 rounded-md border border-[var(--g1-line)] bg-[var(--g1-plum)] p-3 text-xs font-medium text-[var(--g1-ink)]">
          {feedback}
        </div>
      )}

      {/* Dual Tier Comparison Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Tier 1: Free Core */}
        <div className="flex flex-col justify-between rounded-md border border-[var(--g1-line)] bg-[var(--g1-night)] p-5">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--g1-line)] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--g1-ink)]">Free Core</h3>
                <p className="text-xs text-[var(--g1-muted)]">기본 무료 플레이어</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-semibold tabular-nums text-[var(--g1-ink)]">0 WLD</span>
                <span className="block text-xs text-[var(--g1-muted)]">영구 무료</span>
              </div>
            </div>

            {/* Feature List */}
            <ul className="mt-4 space-y-2.5 text-xs text-[var(--g1-text)]">
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-[var(--g1-muted)]" />
                <span>모든 주식 거래, 부동산, 직업 시스템 이용</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-[var(--g1-muted)]" />
                <span>스타 드롭 일일 무료 3회 제공</span>
              </li>
              <li className="flex items-center gap-2 text-[var(--g1-muted)]">
                <EyeOff className="size-4 shrink-0 text-[var(--g1-faint)]" />
                <span>웹 배너 광고 표시 (하단/상단)</span>
              </li>
              <li className="flex items-center gap-2 text-[var(--g1-muted)]">
                <Flame className="size-4 shrink-0 text-[var(--g1-faint)]" />
                <span>프레스티지(환생) 시 자산 0% 보존</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 border-t border-[var(--g1-line)] pt-4">
            <button
              type="button"
              aria-label="Free 플랜 전환"
              disabled={!activeTier}
              onClick={handleToggleSubscribe}
              className="min-h-11 w-full rounded-md border border-[var(--g1-line)] text-xs font-semibold text-[var(--g1-text)] transition-colors hover:bg-[var(--g1-plum)] disabled:opacity-50"
            >
              {!activeTier ? '현재 이용 중인 플랜' : 'Free 플랜으로 전환'}
            </button>
          </div>
        </div>

        {/* Tier 2: Moneyverse Plus VIP */}
        <div className="relative flex flex-col justify-between rounded-md border border-[var(--g1-gold-deep)] bg-[var(--g1-night)] p-5">
          {/* Top highlight badge */}
          <div className="absolute -top-3 right-4 rounded-md border border-[var(--g1-gold-deep)] bg-[var(--g1-night-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--g1-ink)]">
            Best value
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-[var(--g1-line)] pb-3">
              <div>
                <h3 className="flex items-center gap-1.5 text-base font-semibold text-[var(--g1-ink)]">
                  Moneyverse Plus
                  <Crown className="size-4 text-[var(--g1-muted)]" />
                </h3>
                <p className="text-xs text-[var(--g1-muted)]">VIP 프리미엄 구독</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-semibold tabular-nums text-[var(--g1-ink)]">10,000 WLD</span>
                <span className="text-xs text-[var(--g1-muted)] block">/ 30일 (자동 소각)</span>
              </div>
            </div>

            {/* Feature List */}
            <ul className="mt-4 space-y-2.5 text-xs text-[var(--g1-text)]">
              <li className="flex items-center gap-2">
                <Zap className="size-4 shrink-0 text-[var(--g1-muted)]" />
                <span className="font-medium text-[var(--g1-ink)]">100% 광고 완전 제거 (Ad-Free)</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="size-4 shrink-0 text-[var(--g1-muted)]" />
                <span>VIP 골드 네임택 & 전용 프로필 테마</span>
              </li>
              <li className="flex items-center gap-2">
                <Gift className="size-4 shrink-0 text-[var(--g1-muted)]" />
                <span>스타 드롭 일일 5회 (+2회 추가) & 럭키 참</span>
              </li>
              <li className="flex items-center gap-2">
                <Flame className="size-4 shrink-0 text-[var(--g1-muted)]" />
                <span className="font-medium text-[var(--g1-ink)]">프레스티지 환생 시 자산 30% 영구 보존</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="size-4 shrink-0 text-[var(--g1-muted)]" />
                <span>복리 적금 포켓 우대 금리 +0.5%</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 border-t border-[var(--g1-line)] pt-4">
            <button
              type="button"
              aria-label={activeTier ? 'Plus VIP 구독 관리' : 'Plus VIP 시작하기'}
              disabled={isProcessing}
              onClick={handleToggleSubscribe}
              className={`flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-[background-color,transform] duration-150 active:scale-[0.97] ${
                activeTier
                  ? 'border border-[var(--g1-line)] text-[var(--g1-ink)] hover:bg-[var(--g1-plum)]'
                  : 'bg-[var(--g1-violet-ink)] text-[var(--g1-ink)] hover:bg-[var(--g1-violet)] hover:text-[var(--g1-night)]'
              }`}
            >
              {activeTier ? (
                <>
                  <span>Plus VIP 구독 중 (구독 관리)</span>
                  <BadgeCheck className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>지금 10,000 WLD로 Plus 시작하기</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Note */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--g1-line)] pt-3 text-xs text-[var(--g1-muted)]">
        <span className="flex items-center gap-1">
          <Shield className="size-4 shrink-0 text-[var(--g1-muted)]" />
          구독료는 게임 내 WLD 금융 원장에서 시스템 소각 계정으로 100% 영구 소각됩니다.
        </span>
        <span>현금 결제 불가 (In-Game WLD Only)</span>
      </div>
    </div>
  );
}
