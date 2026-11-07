'use client';

import React, { useState } from 'react';
import { Rocket, Coins, Sparkles, Send, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function BusinessGrantBanner() {
  const [modalOpen, setModalOpen] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('COMMERCE');
  const [tier, setTier] = useState<'TIER_1_SEED' | 'TIER_2_GROWTH' | 'TIER_3_INNOVATION'>('TIER_1_SEED');
  const [businessPlan, setBusinessPlan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    try {
      const res = await fetch('/api/treasury/apply-grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: applicantName || '시민 창업자',
          businessName,
          category,
          tier,
          businessPlan,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMsg({ ok: false, text: data.message || '지원금 신청에 실패했습니다.' });
        setIsSubmitting(false);
        return;
      }

      setMsg({ ok: true, text: data.message || '창업 지원금 신청이 성공적으로 접수되었습니다!' });
      setTimeout(() => {
        setModalOpen(false);
      }, 1500);
    } catch {
      setMsg({ ok: false, text: '네트워크 통신 중 오류가 발생했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/40 bg-gradient-to-r from-sky-950/40 via-card to-emerald-950/20 p-5 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-mono">
                중앙 국고 복지금고(VAULT_WELFARE)
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                14일 의무 창업제
              </Badge>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Rocket className="size-4 text-sky-400" />
              <span>창업 자본금이 부족하신가요? 최대 500만 WLD 벤처 지원금 신청</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              머니버스 국고에서 시민들의 신규 사업체 설립을 무상 지원합니다. 1차 AI 스코어링 후 즉시 지급되며, 14일 내 사업체 설립 시 환수 면제됩니다.
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="shrink-0 font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md text-xs h-10 px-4"
          >
            <Coins className="size-4 mr-1.5" />
            창업 지원금 신청하기
          </Button>
        </div>
      </div>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 sm:p-6 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
            <div className="relative w-full max-w-xl rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Coins className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      창업·벤처 지원금 신청서 접수
                    </h2>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      복지금고(VAULT_WELFARE) 원자적 자금 집행 및 14일 의무 창업제
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {msg && (
                <div
                  className={`p-3.5 rounded-xl border font-mono text-xs flex items-center gap-2 ${
                    msg.ok
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                  }`}
                >
                  {msg.ok ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                  <span>{msg.text}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs space-y-1">
                <div className="font-bold text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  <span>1차 AI 자동 스코어링 & 14일 의무 창업</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  신청서 접수 즉시 알고리즘이 사업계획서를 분석하여 1차 AI 점수를 산출합니다. 심사 승인 시 국고 복지금고에서 지갑으로 즉시 입금되며, 승인일로부터 14일 이내 본 페이지에서 사업체를 설립하지 않을 경우 잔여 지원금은 국고로 자동 환수(Clawback)됩니다.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground block">
                      대표자명 / 상호 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="예: 홍길동, 퀀트팀"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground block">
                      사업체 명칭 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="예: 24시 스마트 편의점, 네오물류"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">
                    지원금 티어 선택 (WLD) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-colors ${
                        tier === 'TIER_1_SEED'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">Tier 1 시드</span>
                        <input
                          type="radio"
                          name="biz_tier"
                          value="TIER_1_SEED"
                          checked={tier === 'TIER_1_SEED'}
                          onChange={() => setTier('TIER_1_SEED')}
                          className="text-emerald-500"
                        />
                      </div>
                      <span className="text-sm font-bold font-mono text-emerald-400 mt-1">500,000 WLD</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">편의점·스마트팜 창업</span>
                    </label>

                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-colors ${
                        tier === 'TIER_2_GROWTH'
                          ? 'border-sky-500 bg-sky-500/10'
                          : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">Tier 2 성장형</span>
                        <input
                          type="radio"
                          name="biz_tier"
                          value="TIER_2_GROWTH"
                          checked={tier === 'TIER_2_GROWTH'}
                          onChange={() => setTier('TIER_2_GROWTH')}
                          className="text-sky-500"
                        />
                      </div>
                      <span className="text-sm font-bold font-mono text-sky-400 mt-1">2,000,000 WLD</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">물류센터·핀테크 기업</span>
                    </label>

                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-colors ${
                        tier === 'TIER_3_INNOVATION'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">Tier 3 혁신형</span>
                        <input
                          type="radio"
                          name="biz_tier"
                          value="TIER_3_INNOVATION"
                          checked={tier === 'TIER_3_INNOVATION'}
                          onChange={() => setTier('TIER_3_INNOVATION')}
                          className="text-purple-500"
                        />
                      </div>
                      <span className="text-sm font-bold font-mono text-purple-400 mt-1">5,000,000 WLD</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">대규모 공공·인프라 혁신</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground block">
                    업종 분야 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="COMMERCE">도시 상업 및 24시 편의점</option>
                    <option value="LOGISTICS">스마트 운송 및 도시 물류센터</option>
                    <option value="FINTECH">핀테크 / 분산원장 금융</option>
                    <option value="AI_TECH">인공지능 및 퀀트 리서치</option>
                    <option value="OTHER">기타 가상 비즈니스</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground block">
                    사업계획서 요약 및 자금 활용처 (최소 20자) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    minLength={20}
                    rows={4}
                    placeholder="창업 비즈니스 모델, 고용 효과, 일일 정산 계획 및 구체적 자금 사용처를 20자 이상 기술해 주세요."
                    value={businessPlan}
                    onChange={(e) => setBusinessPlan(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                  />
                  <div className="text-[11px] text-muted-foreground text-right font-mono">
                    {businessPlan.length} / 최소 20자
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                    className="text-xs h-9 font-medium"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || businessPlan.trim().length < 20}
                    className="text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white h-9 shadow-xs"
                  >
                    {isSubmitting ? '접수 처리 중...' : (
                      <>
                        <Send className="size-3.5 mr-1" />
                        창업 지원금 공식 접수
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
