'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

export default function NewClubPage() {
  const router = useRouter();
  const [tag, setTag] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [charter, setCharter] = useState('');
  const [joinMode, setJoinMode] = useState('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTag = tag.toUpperCase().trim();
    if (!/^[A-Z0-9]{2,8}$/.test(cleanTag)) {
      setError('태그는 2~8자 영문 대문자 및 숫자여야 합니다.');
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 30) {
      setError('클럽 이름은 2~30자 이내여야 합니다.');
      return;
    }

    const confirmed = window.confirm(
      '클럽 헌장 등록을 위해 10,000 WLD가 영구 소각(SINK_CLUB_CHARTER)됩니다.\n계속 진행하시겠습니까?',
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/v1/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag: cleanTag,
          name: name.trim(),
          description: description.trim(),
          charter: charter.trim(),
          joinMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || '클럽 창설에 실패했습니다.');
      }

      router.push(`/clubs/${data.club_id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <PageHeader eyebrow="새 클럽 창설" title="새 클럽·협동조합 창설">
        <p>
          고유한 클럽 태그와 헌장을 선포하고, 첫 번째 협동 프로젝트 거점을 마련하세요.
        </p>
      </PageHeader>

      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* WLD 소각 안내 경고 배너 */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-500">
              클럽 헌장 등록비: 10,000 WLD 영구 소각 (Hard Sink)
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              클럽 창설 시 10,000 WLD가 즉시 계좌에서 차감되어 머니버스 소각 계정으로 이동합니다.
              Pay-to-Win 요소는 철저히 배제되며, 순수한 커뮤니티 거점 개척과 소셜 명예를 위해 사용됩니다.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/15 border border-destructive/30 text-destructive text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-xs font-semibold text-foreground">
                클럽 태그 <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase())}
                placeholder="ALPHA"
                maxLength={8}
                required
                className="w-full bg-muted/50 border border-input rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">2~8자 영문 대문자/숫자</p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">
                클럽 이름 <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="알파 협동조합"
                maxLength={30}
                required
                className="w-full bg-muted/50 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">2~30자 이내</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">클럽 소개글</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="클럽의 주요 활동 목적과 분위기를 한 줄로 소개해 주세요."
              maxLength={500}
              className="w-full bg-muted/50 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">클럽 헌장 및 운영 규칙</label>
            <textarea
              rows={4}
              value={charter}
              onChange={(e) => setCharter(e.target.value)}
              placeholder="클럽원들이 공유할 가치관, 협동 목표, 준수해야 할 운영 규칙을 자유롭게 기술하세요."
              maxLength={2000}
              className="w-full bg-muted/50 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">가입 방식</label>
            <select
              value={joinMode}
              onChange={(e) => setJoinMode(e.target.value)}
              className="w-full bg-muted/50 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="public">공개 가입 (누구나 자유롭게 즉시 가입)</option>
              <option value="request">승인제 (가입 요청 후 승인 필요)</option>
              <option value="invite">초대 전용 (운영진 초대로만 가입)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Link
              href="/clubs"
              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted font-medium transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
            >
              {loading ? '창설 및 소각 처리 중...' : '10,000 WLD 소각하고 클럽 창설'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
