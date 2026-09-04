import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import type { AiNewsBatch, AiNewsSettings } from '../../types';
import { AiNewsGenerateForm, AiNewsSettingsForm, ScenarioCard } from './ai-news-console';

export const dynamic = 'force-dynamic';

const PATH = '/admin/market/ai-news';

export const metadata: Metadata = {
  title: 'AI 시장 소식',
  robots: { index: false, follow: false },
};

/**
 * The AI newsroom. Its own page rather than a card on the market screen:
 * five editable scenarios and a settings form are a screen's worth, and
 * the market screen already answers a different question (what is listed,
 * and what is running).
 */
export default async function AiNewsPage() {
  await requireAdminConsole(PATH);
  const [settings, latest] = await Promise.all([
    apiOrNull<{ settings: AiNewsSettings | null }>('/api/v1/admin/ai-news/settings'),
    apiOrNull<{ batch: AiNewsBatch | null }>('/api/v1/admin/ai-news/batches/latest'),
  ]);
  const batch = latest?.batch ?? null;
  const ready = settings?.settings?.has_key === true;

  return (
    <div className="grid gap-5">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/market">← 가상 시장으로</Link>
      </Button>
      <PageHeader eyebrow="AI NEWSROOM" title="AI 시장 소식">
        모델이 시장의 지금을 읽고 이야기를 이어 갈 소식 다섯 개를 제안해요. 고르고, 방향·강도·기간을
        다듬어 발행하면 그 순간부터 시장이 기웁니다. 만든 시나리오는 저장되어 새로고침해도 남아요.
      </PageHeader>

      <AiNewsSettingsForm settings={settings?.settings ?? null} />
      <AiNewsGenerateForm batch={batch} ready={ready} />

      {latest === null ? (
        <EmptyState title="시나리오를 불러오지 못했어요." />
      ) : batch === null ? (
        <EmptyState title="아직 만든 시나리오가 없어요." description="위에서 키를 저장하고 다섯 개를 만들어 보세요." />
      ) : (
        <div className="grid gap-4">
          {batch.scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      )}
    </div>
  );
}
