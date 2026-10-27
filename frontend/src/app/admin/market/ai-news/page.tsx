import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { apiOrNull } from '@/lib/api';
import { parseAiNewsSettingsResponse, parseAiNewsModelsResponse, parseAiNewsLatestResponse, safeRunningSeconds } from './ai-news-evidence';
import { requireAdminConsole } from '@/lib/session';
import { AiNewsAutoGenerateCard, AiNewsGenerateForm, AiNewsSettingsForm, ScenarioCard } from './ai-news-console';

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
  const [settingsRaw, latestRaw, modelsRaw] = await Promise.all([
    apiOrNull<unknown>('/api/v1/admin/ai-news/settings'),
    apiOrNull<unknown>('/api/v1/admin/ai-news/batches/latest'),
    apiOrNull<unknown>('/api/v1/admin/ai-news/models'),
  ]);
  const settings = parseAiNewsSettingsResponse(settingsRaw);
  const latest = parseAiNewsLatestResponse(latestRaw);
  const models = parseAiNewsModelsResponse(modelsRaw);
  const batch = latest?.batch ?? null;
  const run = latest?.run ?? null;
  const ready = settings?.settings?.has_key === true && latest !== null && models !== null;
  // Measured here rather than in the browser: the console is server-rendered
  // and refreshes itself every few seconds while a run is open, so this stays
  // current without a clock ticking in the reader's face.
  const runningFor = safeRunningSeconds(run);

  return (
    <div data-page="admin-market-ai-news" className="mv-page mv-page--admin grid gap-5">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/market">← 가상 시장으로</Link>
      </Button>
      <PageHeader eyebrow="AI NEWSROOM" title="AI 시장 소식">
        모델이 시장의 지금을 읽고 이야기를 이어 갈 소식 다섯 개를 제안해요. 고르고, 방향·강도·기간을
        다듬어 발행하면 그 순간부터 시장이 기웁니다. 만든 시나리오는 저장되어 새로고침해도 남아요.
      </PageHeader>

      {(settings === null || latest === null || models === null) && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          AI 시장 소식의 일부 서버 응답을 확인하지 못했습니다. 검증되지 않은 설정이나 시나리오로 실행·발행하지 않습니다.
          <a href={PATH} className="ml-2 inline-flex min-h-11 items-center rounded-lg px-3 font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">다시 조회</a>
        </div>
      )}
      {settings !== null && (
        <AiNewsSettingsForm settings={settings.settings} models={models ?? { models: [], problem: 'ai_news_model_unreachable' }} />
      )}
      {latest !== null && (
        <>
          <AiNewsAutoGenerateCard ready={ready} />
          <AiNewsGenerateForm batch={batch} run={run} runningFor={runningFor} ready={ready} />
        </>
      )}

      {latest === null ? (
        <EmptyState title="시나리오 조회가 검증되지 않았어요." description="재조회 후 실제 서버 기록을 확인해 주세요." />
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
