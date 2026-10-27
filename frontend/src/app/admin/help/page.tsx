import { randomUUID } from 'node:crypto';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { createVerifiedHelpDraft, publishVerifiedHelp, retractVerifiedHelp } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '도움말 검증 · 관리자', robots: { index: false, follow: false } };

type Draft = { article_id: string; locale: string; slug: string; category: string; title: string;
  body_plain: string; source_url: string; source_sha256: string; reviewed_until: string;
  state: string; version: string; author_id: string; evidenceExpired: boolean;
  canApprove: boolean; canRetract: boolean };

export default async function AdminHelpPage() {
  await requireAdminConsole('/admin/help');
  if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true') notFound();
  const { articles, canDraft } = await api<{ articles: Draft[]; canDraft: boolean }>('/api/v1/admin/help/articles');
  return <main className="mx-auto grid w-full max-w-5xl gap-6 p-4">
    <header><h1 className="text-3xl font-bold">검증된 도움말 관리</h1>
      <p>작성자와 승인자는 달라야 합니다. 근거 원문과 SHA-256을 독립적으로 확인한 뒤 게시하세요.</p></header>
    {canDraft && <section className="rounded-xl border p-4"><h2 className="mb-4 text-xl font-bold">새 비공개 초안</h2>
      <form action={createVerifiedHelpDraft} className="grid gap-3">
        <input type="hidden" name="idempotencyKey" value={randomUUID()} />
        <label>언어 <select name="locale" className="w-full rounded-lg border p-3"><option value="ko">한국어</option><option value="en">English</option></select></label>
        <label>분야 <select name="category" className="w-full rounded-lg border p-3"><option value="account">계정</option><option value="wallet">지갑</option><option value="shop">상점</option><option value="community">커뮤니티</option><option value="support">고객지원</option></select></label>
        <label>URL 식별자 <input name="slug" required maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" className="w-full rounded-lg border p-3" /></label>
        <label>제목 <input name="title" required maxLength={120} className="w-full rounded-lg border p-3" /></label>
        <label>요약 <input name="summary" required maxLength={240} className="w-full rounded-lg border p-3" /></label>
        <label>검증할 본문(일반 텍스트) <textarea name="body" required maxLength={12000} className="min-h-32 w-full rounded-lg border p-3" /></label>
        <label>근거 HTTPS URL <input name="sourceUrl" required type="url" pattern="https://.*" maxLength={2000} className="w-full rounded-lg border p-3" /></label>
        <label>근거 SHA-256 (64자리 소문자 16진수) <input name="sourceSha256" required pattern="[a-f0-9]{64}" className="w-full rounded-lg border p-3" /></label>
        <label>검토 만료 UTC ISO 8601 <input name="reviewedUntil" required placeholder="2026-12-01T00:00:00Z" className="w-full rounded-lg border p-3" /></label>
        <button className="rounded-lg bg-primary p-3 font-bold text-primary-foreground">초안 저장(비공개)</button>
      </form>
    </section>}
    <section className="grid gap-4"><h2 className="text-xl font-bold">승인·철회 검토 대기열(최대 50건)</h2>
      {articles.length === 0 && <p>조회에 성공했으며 검토할 항목이 없습니다.</p>}
      {articles.map(article => <article key={article.article_id} className="grid gap-3 rounded-xl border p-4">
        <h3 className="font-bold">{article.title}</h3><p>{article.locale} / {article.category} / {article.state} / v{article.version}</p>
        {article.evidenceExpired && <p role="status" className="text-sm font-semibold text-destructive">근거 검토 기한이 만료되었습니다. 이 도움말은 공개 조회에서 제외되며 새 검증 없이 게시할 수 없습니다.</p>}
        <details><summary className="cursor-pointer underline">본문과 근거 검토</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words">{article.body_plain}</pre>
          <p className="break-all text-sm">근거: {article.source_url} / SHA-256: {article.source_sha256}</p>
          <p className="text-sm">검토 만료: {article.reviewed_until}</p>
        </details>
        {article.state === 'draft' && article.canApprove && <form action={publishVerifiedHelp} className="flex flex-wrap gap-2">
          <input type="hidden" name="articleId" value={article.article_id} /><input type="hidden" name="expectedVersion" value={article.version} />
          <input type="hidden" name="idempotencyKey" value={randomUUID()} />
          <button className="rounded-lg border p-3 font-semibold">독립 검토 후 승인·게시</button>
        </form>}
        {article.state === 'published' && article.canRetract && <form action={retractVerifiedHelp} className="flex flex-wrap gap-2">
          <input type="hidden" name="articleId" value={article.article_id} /><input type="hidden" name="expectedVersion" value={article.version} />
          <input type="hidden" name="idempotencyKey" value={randomUUID()} />
          <button className="rounded-lg border p-3 font-semibold">즉시 공개 철회</button>
        </form>}
      </article>)}
    </section>
  </main>;
}
