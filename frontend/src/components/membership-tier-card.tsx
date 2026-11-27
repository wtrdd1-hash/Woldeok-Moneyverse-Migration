'use client';

import React, { useState, useEffect } from 'react';
import { Crown, Check, Shield, BadgeCheck, Ticket, CircleSlash } from 'lucide-react';
import type { Copy } from '@/lib/copy';
import { pick } from '@/lib/copy';
import { fill } from '@/lib/copy-format';
import { canonicalIntegerString, compareAmounts, groupDigits } from '@/lib/money';
import { useLocale } from '@/components/locale-provider';

/**
 * The pass as the shop catalogue returned it. Name and description are catalogue data and are
 * shown as sent; the price is the catalogue's integer string.
 */
export interface MembershipPass {
  readonly catalogId: string;
  readonly name: string;
  readonly description: string;
  readonly price: string;
}

interface MembershipTierCardProps {
  /** null = the balance could not be read; never treated as 0. */
  userBalance?: number | string | null;
  isPlusMember?: boolean;
  /** null = the catalogue did not return the pass, so nothing is offered. */
  pass?: MembershipPass | null;
  onSubscribe?: (catalogId: string) => Promise<boolean | void> | void;
  /** Resolves true only when a server confirmed the cancellation. */
  onCancel?: () => Promise<boolean> | boolean;
}

/*
 * Decision v2026.11.27.1101.1: the card used to list ad removal, extra star drops, prestige asset
 * preservation, a +0.5% pocket rate and a gold nametag as Plus benefits. No backend implements
 * any of them (the catalogue row has an empty effect), so they are named as unavailable instead.
 * Korean strings are the owner's copy except where a claim was untrue; those corrections are
 * recorded in docs/worklog/2026-11-27-w03-design-180.md.
 */
export const MEMBERSHIP_COPY = {
  title: {
    ko: 'Moneyverse Plus 멤버십 티어',
    en: 'Moneyverse Plus membership',
    ja: 'Moneyverse Plus メンバーシップ',
    zh: 'Moneyverse Plus 会员',
    vi: 'Hội viên Moneyverse Plus',
  },
  subtitle: {
    ko: '게임 내 100% 가상재화(WLD)로 구매하는 상점 패스',
    en: 'A shop pass bought only with in-game WLD',
    ja: 'ゲーム内通貨(WLD)だけで購入するショップのパス',
    zh: '仅用游戏内货币(WLD)购买的商店通行证',
    vi: 'Thẻ cửa hàng chỉ mua bằng WLD trong game',
  },
  activeBadge: { ko: 'Plus VIP 활성 중', en: 'Plus VIP active', ja: 'Plus VIP 有効', zh: 'Plus VIP 已生效', vi: 'Plus VIP đang hoạt động' },
  freeBadge: { ko: '무료 (Free Core) 이용 중', en: 'On Free Core', ja: '無料 (Free Core) を利用中', zh: '正在使用免费版 (Free Core)', vi: 'Đang dùng gói miễn phí (Free Core)' },
  freeName: { ko: 'Free Core', en: 'Free Core', ja: 'Free Core', zh: 'Free Core', vi: 'Free Core' },
  freeSub: { ko: '기본 무료 플레이어', en: 'Standard free player', ja: '基本無料プレイヤー', zh: '基础免费玩家', vi: 'Người chơi miễn phí cơ bản' },
  freePrice: { ko: '0 WLD', en: '0 WLD', ja: '0 WLD', zh: '0 WLD', vi: '0 WLD' },
  freeForever: { ko: '영구 무료', en: 'Free forever', ja: 'ずっと無料', zh: '永久免费', vi: 'Miễn phí vĩnh viễn' },
  freeFeature: {
    ko: '모든 주식 거래, 부동산, 직업 시스템 이용',
    en: 'All stock trading, property and job systems',
    ja: 'すべての株式取引・不動産・職業システムを利用',
    zh: '可使用全部股票交易、房产和职业系统',
    vi: 'Dùng mọi giao dịch cổ phiếu, bất động sản và hệ thống nghề nghiệp',
  },
  freeCurrent: { ko: '현재 이용 중인 플랜', en: 'Your current plan', ja: '現在のプラン', zh: '当前方案', vi: 'Gói hiện tại' },
  freeSwitch: { ko: 'Free 플랜으로 전환', en: 'Switch to Free', ja: 'Free プランに切り替え', zh: '切换到免费方案', vi: 'Chuyển sang gói Free' },
  freeSwitchLabel: { ko: 'Free 플랜 전환', en: 'Switch to the Free plan', ja: 'Free プランへの切り替え', zh: '切换到免费方案', vi: 'Chuyển sang gói Free' },
  plusName: { ko: 'Moneyverse Plus', en: 'Moneyverse Plus', ja: 'Moneyverse Plus', zh: 'Moneyverse Plus', vi: 'Moneyverse Plus' },
  passIncludes: { ko: '상점 설명', en: 'Catalogue description', ja: 'ショップの説明', zh: '商店说明', vi: 'Mô tả trong cửa hàng' },
  unavailableBenefits: {
    ko: '광고 제거, 스타 드롭 추가, 환생 자산 보존, 적금 우대 금리, 골드 네임택은 아직 제공되지 않아요.',
    en: 'Ad removal, extra star drops, prestige asset preservation, a preferential savings rate and a gold name tag are not available yet.',
    ja: '広告の非表示、スタードロップの追加、転生時の資産保持、積立の優遇金利、ゴールドネームタグはまだ提供されていません。',
    zh: '去除广告、额外星星掉落、转生资产保留、储蓄优惠利率和金色名牌目前尚未提供。',
    vi: 'Xóa quảng cáo, thêm lượt rơi sao, giữ tài sản khi chuyển sinh, lãi suất tiết kiệm ưu đãi và thẻ tên vàng hiện chưa được cung cấp.',
  },
  passUnavailable: {
    ko: '지금은 멤버십 패스 정보를 불러오지 못했어요.',
    en: 'The membership pass could not be loaded right now.',
    ja: '現在、メンバーシップパスの情報を読み込めませんでした。',
    zh: '暂时无法加载会员通行证信息。',
    vi: 'Hiện không tải được thông tin thẻ hội viên.',
  },
  plusActive: { ko: 'Plus VIP 구독 중 (구독 관리)', en: 'Plus VIP active (manage)', ja: 'Plus VIP 利用中 (管理)', zh: 'Plus VIP 使用中 (管理)', vi: 'Đang dùng Plus VIP (quản lý)' },
  plusStart: {
    ko: '지금 {price} WLD로 Plus 시작하기',
    en: 'Start Plus for {price} WLD',
    ja: '{price} WLDで Plus を始める',
    zh: '用 {price} WLD 开通 Plus',
    vi: 'Bắt đầu Plus với {price} WLD',
  },
  plusManageLabel: { ko: 'Plus VIP 구독 관리', en: 'Manage Plus VIP', ja: 'Plus VIP の管理', zh: '管理 Plus VIP', vi: 'Quản lý Plus VIP' },
  plusStartLabel: { ko: 'Plus VIP 시작하기', en: 'Start Plus VIP', ja: 'Plus VIP を始める', zh: '开通 Plus VIP', vi: 'Bắt đầu Plus VIP' },
  balanceUnknown: {
    ko: '지금은 잔액을 확인할 수 없어요. 잠시 후 다시 시도해 주세요.',
    en: 'Your balance cannot be checked right now. Please try again shortly.',
    ja: '現在、残高を確認できません。しばらくしてからもう一度お試しください。',
    zh: '暂时无法确认余额，请稍后再试。',
    vi: 'Hiện không kiểm tra được số dư. Vui lòng thử lại sau.',
  },
  insufficient: {
    ko: '잔액이 부족합니다. (필요: {need} WLD / 보유: {have} WLD)',
    en: 'Not enough balance (needed: {need} WLD / held: {have} WLD)',
    ja: '残高が不足しています。(必要: {need} WLD / 保有: {have} WLD)',
    zh: '余额不足。(需要: {need} WLD / 持有: {have} WLD)',
    vi: 'Không đủ số dư. (Cần: {need} WLD / Có: {have} WLD)',
  },
  subscribed: {
    ko: 'Moneyverse Plus VIP 멤버십이 활성화되었습니다. {price} WLD가 영구 소각되었습니다.',
    en: 'Moneyverse Plus VIP is active. {price} WLD was permanently burned.',
    ja: 'Moneyverse Plus VIP が有効になりました。{price} WLD が永久に焼却されました。',
    zh: 'Moneyverse Plus VIP 已开通。{price} WLD 已永久销毁。',
    vi: 'Moneyverse Plus VIP đã kích hoạt. {price} WLD đã bị đốt vĩnh viễn.',
  },
  cancelUnavailable: {
    ko: '지금은 구독 취소를 처리할 수 없어요. 보유 중인 패스는 유효기간이 끝나면 자동으로 만료됩니다.',
    en: 'Cancellation is not available. A pass you hold expires on its own when its period ends.',
    ja: '現在、解約は処理できません。保有中のパスは有効期間が終わると自動的に失効します。',
    zh: '目前无法处理取消。持有的通行证会在有效期结束后自动失效。',
    vi: 'Hiện chưa thể hủy. Thẻ bạn đang có sẽ tự hết hạn khi hết thời hạn.',
  },
  failed: { ko: '처리 실패: {message}', en: 'Could not complete: {message}', ja: '処理に失敗しました: {message}', zh: '处理失败: {message}', vi: 'Không thể hoàn tất: {message}' },
  genericError: { ko: '오류가 발생했습니다.', en: 'Something went wrong.', ja: 'エラーが発生しました。', zh: '发生错误。', vi: 'Đã xảy ra lỗi.' },
  compliance: {
    ko: '패스 대금은 게임 내 WLD 금융 원장에서 시스템 소각 계정으로 100% 영구 소각됩니다.',
    en: 'The pass price is burned in full from the in-game WLD ledger into the system sink account.',
    ja: 'パスの代金はゲーム内WLD台帳からシステム焼却口座へ100%永久に焼却されます。',
    zh: '通行证款项会从游戏内WLD账本100%永久销毁至系统销毁账户。',
    vi: 'Tiền mua thẻ được đốt vĩnh viễn 100% từ sổ cái WLD trong game vào tài khoản đốt của hệ thống.',
  },
  noCash: { ko: '현금 결제 불가 (In-Game WLD Only)', en: 'No cash payments (in-game WLD only)', ja: '現金決済不可 (ゲーム内WLDのみ)', zh: '不支持现金支付 (仅限游戏内WLD)', vi: 'Không thanh toán bằng tiền mặt (chỉ WLD trong game)' },
} satisfies Record<string, Copy>;

export function MembershipTierCard({
  userBalance = 0,
  isPlusMember = false,
  pass = null,
  onSubscribe,
  onCancel,
}: MembershipTierCardProps) {
  const { locale } = useLocale();
  const t = (copy: Copy) => pick(locale, copy);
  const [activeTier, setActiveTier] = useState<boolean>(isPlusMember);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setActiveTier(Boolean(isPlusMember));
  }, [isPlusMember]);

  // Money stays a canonical integer string; a balance that cannot be read is never treated as 0.
  const balance = userBalance === null ? null : canonicalIntegerString(userBalance);
  const price = pass ? canonicalIntegerString(pass.price) : null;
  const priceText = price ? groupDigits(price) : null;

  const handleToggleSubscribe = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setFeedback(null);

    try {
      if (activeTier) {
        const confirmed = onCancel ? await onCancel() : false;
        if (!confirmed) {
          setFeedback(t(MEMBERSHIP_COPY.cancelUnavailable));
          return;
        }
        setActiveTier(false);
      } else {
        if (!pass || !price || !priceText) return;
        if (balance === null) {
          setFeedback(t(MEMBERSHIP_COPY.balanceUnknown));
          return;
        }
        if (compareAmounts(balance, price) < 0) {
          setFeedback(t(fill(MEMBERSHIP_COPY.insufficient, { need: priceText, have: groupDigits(balance) })));
          return;
        }
        if (onSubscribe) {
          const res = await onSubscribe(pass.catalogId);
          if (res === false) return;
        }
        setActiveTier(true);
        setFeedback(t(fill(MEMBERSHIP_COPY.subscribed, { price: priceText })));
      }
    } catch (err: unknown) {
      const message = err instanceof Error && err.message ? err.message : t(MEMBERSHIP_COPY.genericError);
      setFeedback(t(fill(MEMBERSHIP_COPY.failed, { message })));
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
            <Crown className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[var(--g1-ink)]">{t(MEMBERSHIP_COPY.title)}</h2>
              <span className="rounded-md border border-[var(--g1-line)] px-2 py-0.5 text-xs font-medium text-[var(--g1-muted)]">
                VIP Tier 2.0
              </span>
            </div>
            <p className="text-xs text-[var(--g1-muted)]">{t(MEMBERSHIP_COPY.subtitle)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTier ? (
            <div className="flex items-center gap-1.5 rounded-md border border-[var(--g1-line)] px-3 py-1 text-xs font-medium text-[var(--g1-ink)]">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              <span>{t(MEMBERSHIP_COPY.activeBadge)}</span>
            </div>
          ) : (
            <div className="rounded-md border border-[var(--g1-line)] px-3 py-1 text-xs font-medium text-[var(--g1-muted)]">
              {t(MEMBERSHIP_COPY.freeBadge)}
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div role="status" className="mt-4 rounded-md border border-[var(--g1-line)] bg-[var(--g1-plum)] p-3 text-xs font-medium text-[var(--g1-ink)]">
          {feedback}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Free Core */}
        <div className="flex flex-col justify-between rounded-md border border-[var(--g1-line)] bg-[var(--g1-night)] p-5">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--g1-line)] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--g1-ink)]">{t(MEMBERSHIP_COPY.freeName)}</h3>
                <p className="text-xs text-[var(--g1-muted)]">{t(MEMBERSHIP_COPY.freeSub)}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-semibold tabular-nums text-[var(--g1-ink)]">{t(MEMBERSHIP_COPY.freePrice)}</span>
                <span className="block text-xs text-[var(--g1-muted)]">{t(MEMBERSHIP_COPY.freeForever)}</span>
              </div>
            </div>
            <ul className="mt-4 space-y-2.5 text-xs text-[var(--g1-text)]">
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-[var(--g1-muted)]" aria-hidden="true" />
                <span>{t(MEMBERSHIP_COPY.freeFeature)}</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 border-t border-[var(--g1-line)] pt-4">
            <button
              type="button"
              aria-label={t(MEMBERSHIP_COPY.freeSwitchLabel)}
              disabled={!activeTier}
              onClick={handleToggleSubscribe}
              className="min-h-11 w-full rounded-md border border-[var(--g1-line)] text-xs font-semibold text-[var(--g1-text)] transition-colors hover:bg-[var(--g1-plum)] disabled:opacity-50"
            >
              {!activeTier ? t(MEMBERSHIP_COPY.freeCurrent) : t(MEMBERSHIP_COPY.freeSwitch)}
            </button>
          </div>
        </div>

        {/* Moneyverse Plus */}
        <div className="flex flex-col justify-between rounded-md border border-[var(--g1-line)] bg-[var(--g1-night)] p-5">
          <div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--g1-line)] pb-3">
              <div className="min-w-0">
                <h3 className="flex items-center gap-1.5 text-base font-semibold text-[var(--g1-ink)]">
                  {t(MEMBERSHIP_COPY.plusName)}
                  <Crown className="size-4 text-[var(--g1-muted)]" aria-hidden="true" />
                </h3>
                {pass ? <p className="text-xs text-[var(--g1-muted)]">{pass.name}</p> : null}
              </div>
              {priceText ? (
                <span className="shrink-0 text-xl font-semibold tabular-nums text-[var(--g1-ink)]">{priceText} WLD</span>
              ) : null}
            </div>

            {pass ? (
              <ul className="mt-4 space-y-2.5 text-xs text-[var(--g1-text)]">
                <li className="flex items-start gap-2">
                  <Ticket className="mt-px size-4 shrink-0 text-[var(--g1-muted)]" aria-hidden="true" />
                  <span>
                    <span className="sr-only">{t(MEMBERSHIP_COPY.passIncludes)}: </span>
                    {pass.description}
                  </span>
                </li>
                <li className="flex items-start gap-2 text-[var(--g1-muted)]" data-testid="membership-unavailable-benefits">
                  <CircleSlash className="mt-px size-4 shrink-0 text-[var(--g1-faint)]" aria-hidden="true" />
                  <span>{t(MEMBERSHIP_COPY.unavailableBenefits)}</span>
                </li>
              </ul>
            ) : (
              <p className="mt-4 text-xs text-[var(--g1-muted)]">{t(MEMBERSHIP_COPY.passUnavailable)}</p>
            )}
          </div>

          <div className="mt-6 border-t border-[var(--g1-line)] pt-4">
            <button
              type="button"
              aria-label={activeTier ? t(MEMBERSHIP_COPY.plusManageLabel) : t(MEMBERSHIP_COPY.plusStartLabel)}
              disabled={isProcessing || (!activeTier && !priceText)}
              onClick={handleToggleSubscribe}
              className={`flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-[background-color,transform] duration-150 active:scale-[0.97] disabled:opacity-50 ${
                activeTier
                  ? 'border border-[var(--g1-line)] text-[var(--g1-ink)] hover:bg-[var(--g1-plum)]'
                  : 'bg-[var(--g1-violet-ink)] text-[var(--g1-ink)] hover:bg-[var(--g1-violet)] hover:text-[var(--g1-night)]'
              }`}
            >
              {activeTier ? (
                <>
                  <span>{t(MEMBERSHIP_COPY.plusActive)}</span>
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                </>
              ) : (
                <span>{priceText ? t(fill(MEMBERSHIP_COPY.plusStart, { price: priceText })) : t(MEMBERSHIP_COPY.plusStartLabel)}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--g1-line)] pt-3 text-xs text-[var(--g1-muted)]">
        <span className="flex items-center gap-1">
          <Shield className="size-4 shrink-0 text-[var(--g1-muted)]" aria-hidden="true" />
          {t(MEMBERSHIP_COPY.compliance)}
        </span>
        <span>{t(MEMBERSHIP_COPY.noCash)}</span>
      </div>
    </div>
  );
}
