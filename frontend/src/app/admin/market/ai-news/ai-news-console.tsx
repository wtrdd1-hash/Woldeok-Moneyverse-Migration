'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IDLE } from '@/lib/action-state';
import { cn } from '@/lib/cn';
import { formatMoment } from '@/lib/money';
import { StepUpField } from '../../step-up-field';
import type {
  AiNewsBatch,
  AiNewsModelList,
  AiNewsRun,
  AiNewsScenario,
  AiNewsScenarioEffect,
  AiNewsSettings,
} from '../../types';
import { STRENGTHS, strengthLabel } from '../strengths';
import { autoGenerateAiNews, decideAiNewsScenario, generateAiNews, saveAiNewsSettings } from './actions';
import { aiNewsSentence } from './sentences';

/** Why the model field has no list beside it, in a sentence an operator can act on. */
const NO_LIST: Readonly<Record<string, string>> = {
  ai_news_key_missing: '키를 저장하면 이 키로 쓸 수 있는 모델을 여기에 모아 둘게요.',
  ai_news_sealing_unavailable: '이 배포에는 봉인 키가 없어 저장된 키를 열 수 없어요.',
  ai_news_model_rejected_key: '저장된 키를 API가 거부해서 목록을 받지 못했어요.',
  ai_news_model_unreachable: '주소에 닿지 못해 목록을 받지 못했어요.',
  ai_news_model_unusable: '이 주소는 모델 목록을 주지 않네요. 모델 이름을 직접 적어 주세요.',
  ai_news_model_refused: '목록을 받지 못했어요.',
};

/**
 * The AI newsroom's console: where the model is, what it last proposed,
 * and the five cards an operator chooses from. Everything here is what the
 * database holds, so a reload draws the same five.
 *
 * The address is an OpenAI-standard base -- the API this calls is
 * `{주소}/chat/completions`, and `{주소}/models` is where the list beside
 * the model field comes from. The field stays a field: a server that will
 * not list its models is still a server an operator can name a model on.
 */
export function AiNewsSettingsForm({
  settings,
  models,
}: {
  readonly settings: AiNewsSettings | null;
  readonly models: AiNewsModelList;
}) {
  const [state, action] = useActionState(saveAiNewsSettings, IDLE);
  const listed = models.models.length;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">모델 연결</CardTitle>
        <CardDescription>
          키는 이 배포의 봉인 키로 암호화해 저장되고, 호출하는 순간에만 풀립니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="ai-base-url">API 주소</FieldLabel>
            <Input
              id="ai-base-url"
              name="apiBaseUrl"
              defaultValue={settings?.api_base_url ?? 'https://api.openai.com/v1'}
              required
              className="font-mono text-sm"
            />
            <FieldDescription>
              OpenAI 표준을 따르는 주소예요. 뒤에 /chat/completions와 /models를 붙여 부릅니다. OpenAI는
              https://api.openai.com/v1, Anthropic은 https://api.anthropic.com/v1, 직접 띄운 서버도 같은 규격이면 됩니다.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="ai-model">모델</FieldLabel>
            <Input
              id="ai-model"
              name="model"
              list="ai-model-options"
              defaultValue={settings?.model ?? 'gpt-4o-mini'}
              required
              className="font-mono text-sm"
            />
            <datalist id="ai-model-options">
              {models.models.map((model) => (
                <option key={model} value={model} />
              ))}
            </datalist>
            <FieldDescription>
              {listed > 0
                ? `이 키로 쓸 수 있는 모델 ${listed}개를 목록에 담아 뒀어요. 눌러서 고르거나 직접 적어도 됩니다.`
                : (models.problem ? NO_LIST[models.problem] : undefined) ?? '모델 이름을 직접 적어 주세요.'}
            </FieldDescription>
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="ai-key">API 키</FieldLabel>
            <Input
              id="ai-key"
              name="apiKey"
              type="password"
              autoComplete="off"
              placeholder={settings?.has_key ? `저장된 키 사용 중 (…${settings.api_key_hint}). 바꾸려면 새 키 입력` : '아직 키가 없어요'}
              className="font-mono text-sm"
            />
            <FieldDescription>
              {settings?.has_key
                ? `비워 두면 저장된 키를 그대로 씁니다. 마지막 저장 ${formatMoment(settings.updated_at)}.`
                : '키를 넣어야 시나리오를 만들 수 있어요.'}
            </FieldDescription>
          </Field>
          <div className="sm:col-span-2">
            <StepUpField id="ai-news-settings" undo="같은 화면에서 이전 주소·모델로 다시 저장하거나 새 키를 넣습니다." />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <SubmitButton>설정 저장</SubmitButton>
            <ActionAlert state={state} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * 1-Click 자동 AI 주식 뉴스 생성 및 즉시 발행 카드
 */
export function AiNewsAutoGenerateCard({
  ready,
}: {
  readonly ready: boolean;
}) {
  const [state, action] = useActionState(autoGenerateAiNews, IDLE);
  const [publishImmediate, setPublishImmediate] = useState(true);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-lg">🤖</span> 활성 상장 주식 기반 AI 뉴스 자동 생성 및 즉시 발행
          </CardTitle>
          <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
            Auto Stock Analyzer &amp; Generator
          </Badge>
        </div>
        <CardDescription>
          현재 DB에 상장 및 활성화된 가상 주식(WDT, WDM, WDB, CHIMU314, FNAK 등)의 최근 시세·변동률을 자동으로 조회하고,
          AI 모델이 시장 상황에 맞는 시나리오를 자동 구성하여 즉시 시장에 발행합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-lg border bg-background">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm">
              <input
                type="checkbox"
                name="publishImmediate"
                value="true"
                checked={publishImmediate}
                onChange={(e) => setPublishImmediate(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="font-semibold text-foreground">생성 즉시 시장에 뉴스 발행 (시세 변동 즉시 반영)</span>
            </label>
            <span className="text-xs text-muted-foreground">
              {publishImmediate ? '선정된 1위 시나리오가 즉시 시장에 반영됩니다.' : '시나리오 5개만 생성되고 검토 후 수동 발행합니다.'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton disabled={!ready} variant="default" className="font-semibold shadow-sm">
              ⚡ 1-클릭 AI 주식 뉴스 자동 생성{publishImmediate ? ' & 즉시 발행' : ''}
            </SubmitButton>
            {!ready && (
              <span className="text-xs text-destructive">
                위 모델 연결 카드에서 API 키를 먼저 저장해 주세요.
              </span>
            )}
            <ActionAlert state={state} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function duration(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes}분` : `${minutes}분 ${rest}초`;
}

/**
 * Asking is a run, not a request (149). The model takes longer than the
 * gateways in front of this page will hold a connection open for, so the
 * button starts a run and this card reports it: what it is doing and for how
 * long while it runs, and why there are no scenarios when it ends without
 * any. The page refreshes itself only while a run is open.
 */
export function AiNewsGenerateForm({
  batch,
  run,
  runningFor,
  ready,
}: {
  readonly batch: AiNewsBatch | null;
  readonly run: AiNewsRun | null;
  /** Seconds since the open run started, measured on the server. */
  readonly runningFor: number;
  readonly ready: boolean;
}) {
  const [state, action] = useActionState(generateAiNews, IDLE);
  const running = run?.running === true;
  const failed = run !== null && !run.running && run.failure_code !== null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">시나리오 만들기</CardTitle>
        <CardDescription>
          모델은 모든 종목의 가격과 흐름, 진행 중·최근 끝난 소식, 이미 낸 시나리오와 시각, 거시 지표를 받고
          이야기를 이어 가는 다섯 개를 제안해요. 다시 만들면 이전 다섯은 접히고 새 다섯이 남습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <Field>
            <FieldLabel htmlFor="ai-prompt">원하는 방향 (선택)</FieldLabel>
            <Textarea
              id="ai-prompt"
              name="prompt"
              rows={3}
              maxLength={2000}
              placeholder="예: 이번 주는 뮤야얌 전자에 악재가 이어지다가 주말에 반전이 오면 좋겠어요. 시장 전체는 조용하게."
            />
            <FieldDescription>비워 두면 지금 흐름을 그대로 이어 갑니다. 적으면 그 방향으로, 단 흐름과 어긋나지 않게 만들어요.</FieldDescription>
            {batch?.operator_prompt && (
              <p className="mt-1 text-xs text-muted-foreground">
                이전 요청: &ldquo;{batch.operator_prompt}&rdquo;
              </p>
            )}
          </Field>

          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton disabled={running || !ready}>
              {running ? '소재 만드는 중…' : '새 소재 다섯 개 제안받기'}
            </SubmitButton>
            {!ready && (
              <span className="text-xs text-muted-foreground">
                모델 연결에 키를 넣어야 만들 수 있어요.
              </span>
            )}
            {running && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block size-2 animate-ping rounded-full bg-primary" />
                모델에 물어보고 있어요 ({duration(runningFor)}째)
              </span>
            )}
          </div>

          {failed && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              <p className="font-bold">{aiNewsSentence(run.failure_code, '시나리오를 만들지 못했어요.')}</p>
              {run.failure_detail !== '' && (
                <p className="mt-1 font-mono text-xs break-all text-muted-foreground">{run.failure_detail}</p>
              )}
            </div>
          )}

          {batch && (
            <p className="text-xs text-muted-foreground">
              현재 묶음: {formatMoment(batch.created_at)} · {batch.model}
            </p>
          )}
          <ActionAlert state={state} />
        </form>
      </CardContent>
    </Card>
  );
}

const STATUS: Readonly<Record<AiNewsScenario['status'], string>> = {
  proposed: '제안',
  published: '발행됨',
  discarded: '접음',
  superseded: '지난 묶음',
};

const SELECT_CLASS =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30';

const DIRECTIONS = [
  { value: 'up', label: '호재' },
  { value: 'down', label: '악재' },
  { value: 'none', label: '소식만' },
] as const;

function scopeOf(effect: Pick<AiNewsScenarioEffect, 'symbol' | 'name'>): string {
  return effect.symbol ? `${effect.symbol} ${effect.name ?? ''}`.trim() : '시장 전체';
}

/**
 * What the story does to one stock, in one chip: the stock, which way, and
 * how hard. This is the whole card until an operator opens it -- five
 * stories read as five stories, not as five identical forms.
 */
function EffectChip({ effect }: { readonly effect: AiNewsScenarioEffect }) {
  const moves = effect.direction !== 'none';
  const up = effect.direction === 'up';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs',
        !moves && 'text-muted-foreground',
        moves && (up ? 'border-rise/50 text-rise' : 'border-fall/50 text-fall'),
      )}
    >
      <span className="font-mono">{scopeOf(effect)}</span>
      <span className="font-bold">
        {moves ? `${up ? '▲ 호재' : '▼ 악재'} · ${strengthLabel(effect.strength)}` : '— 소식'}
      </span>
    </span>
  );
}

/**
 * One story. Closed, it is a headline, why the model wrote it, and what it
 * does to each stock it names. Opened -- which is what choosing it means --
 * it is the editor for those same values: the operator settles each stock's
 * lean and strength, the hours and the text, and publishes one piece of news
 * that moves them all.
 */
export function ScenarioCard({ scenario }: { readonly scenario: AiNewsScenario }) {
  const [state, action] = useActionState(decideAiNewsScenario, IDLE);
  const [chosen, setChosen] = useState(false);
  const open = scenario.status === 'proposed';
  const id = scenario.id.slice(0, 8);
  const moved = scenario.effects.filter((effect) => effect.direction !== 'none').length;

  return (
    <Card className={cn(!open && 'opacity-70')}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary">#{scenario.ordinal}</Badge>
          <Badge variant={scenario.status === 'published' ? 'default' : 'outline'}>{STATUS[scenario.status]}</Badge>
          <span className="text-muted-foreground">
            {scenario.hours}시간 · 종목 {scenario.effects.length}개 중 {moved}개 이동
          </span>
          {scenario.decided_at && <span className="text-muted-foreground">{formatMoment(scenario.decided_at)}</span>}
        </div>
        <CardTitle className="text-base">{scenario.headline}</CardTitle>
        {scenario.rationale && (
          <CardDescription className="[word-break:keep-all]">왜 지금: {scenario.rationale}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {scenario.effects.map((effect) => (
            <EffectChip key={effect.id} effect={effect} />
          ))}
        </div>

        {scenario.body && <p className="text-sm text-muted-foreground [word-break:keep-all]">{scenario.body}</p>}

        {open && !chosen && (
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={() => setChosen(true)}>
              이 소재 고르기
            </Button>
            <span className="text-xs text-muted-foreground">고르면 종목별 방향과 강도를 다듬어 발행할 수 있어요.</span>
          </div>
        )}

        {open && chosen && (
          <form action={action} className="grid gap-4 border-t pt-4">
            <input type="hidden" name="scenarioId" value={scenario.id} />
            <input type="hidden" name="effectCount" value={scenario.effects.length} />

            <fieldset className="grid gap-2">
              <legend className="text-sm font-bold">종목별 영향</legend>
              {scenario.effects.map((effect, index) => (
                <div key={effect.id} className="grid items-center gap-2 sm:grid-cols-[1fr_auto_auto]">
                  <input type="hidden" name={`effect-${index}-stockId`} value={effect.stock_id ?? ''} />
                  <span className="font-mono text-sm">{scopeOf(effect)}</span>
                  <label className="grid gap-1">
                    <span className="sr-only">{scopeOf(effect)} 방향</span>
                    <select name={`effect-${index}-direction`} defaultValue={effect.direction} className={SELECT_CLASS}>
                      {DIRECTIONS.map((direction) => (
                        <option key={direction.value} value={direction.value}>
                          {direction.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1">
                    <span className="sr-only">{scopeOf(effect)} 강도</span>
                    <select name={`effect-${index}-strength`} defaultValue={effect.strength} className={SELECT_CLASS}>
                      {STRENGTHS.map((strength) => (
                        <option key={strength.value} value={strength.value}>
                          {strength.label} · {strength.detail}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
              <FieldDescription>
                발행하는 순간 호재는 값이 뛰고 악재는 떨어져요 (소폭 0.8 %, 보통 2.5 %, 강력 6 %). 그 뒤로는 위 강도만큼
                기울어 갑니다. &lsquo;소식만&rsquo;은 이야기에 등장하되 값은 건드리지 않아요.
              </FieldDescription>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <Field>
                <FieldLabel htmlFor={`headline-${id}`}>제목</FieldLabel>
                <Input id={`headline-${id}`} name="headline" defaultValue={scenario.headline} minLength={2} maxLength={120} required />
              </Field>
              <Field>
                <FieldLabel htmlFor={`hours-${id}`}>기간 (시간)</FieldLabel>
                <Input id={`hours-${id}`} name="hours" type="number" inputMode="numeric" min={1} max={168} defaultValue={scenario.hours} required />
                <FieldDescription>1~168시간</FieldDescription>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor={`body-${id}`}>본문</FieldLabel>
              <Textarea id={`body-${id}`} name="body" defaultValue={scenario.body} rows={4} maxLength={2000} />
            </Field>

            <div className="flex flex-wrap items-center gap-2">
              <SubmitButton name="intent" value="publish">이 소식 발행</SubmitButton>
              <SubmitButton name="intent" value="discard" variant="outline">접어 두기</SubmitButton>
              <Button type="button" variant="ghost" onClick={() => setChosen(false)}>
                닫기
              </Button>
            </div>
            <ActionAlert state={state} />
          </form>
        )}
      </CardContent>
    </Card>
  );
}
