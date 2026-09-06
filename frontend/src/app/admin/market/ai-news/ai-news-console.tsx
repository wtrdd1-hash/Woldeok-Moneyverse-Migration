'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IDLE } from '@/lib/action-state';
import { cn } from '@/lib/cn';
import { formatMoment } from '@/lib/money';
import { StepUpField } from '../../step-up-field';
import type { AiNewsBatch, AiNewsScenario, AiNewsSettings } from '../../types';
import { STRENGTHS } from '../market-events';
import { decideAiNewsScenario, generateAiNews, saveAiNewsSettings } from './actions';

/**
 * The AI newsroom's console: where the model is, what it last proposed,
 * and the five cards an operator chooses from. Everything here is what the
 * database holds, so a reload draws the same five.
 */
export function AiNewsSettingsForm({ settings }: { readonly settings: AiNewsSettings | null }) {
  const [state, action] = useActionState(saveAiNewsSettings, IDLE);
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
              defaultValue={settings?.api_base_url ?? 'https://api.anthropic.com'}
              required
              className="font-mono text-sm"
            />
            <FieldDescription>Anthropic API 또는 같은 규격의 프록시 주소.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="ai-model">모델</FieldLabel>
            <Input id="ai-model" name="model" defaultValue={settings?.model ?? 'claude-opus-5'} required className="font-mono text-sm" />
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
            <SubmitButton>연결 정보 저장</SubmitButton>
          </div>
          <div className="sm:col-span-2">
            <ActionAlert state={state} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function AiNewsGenerateForm({ batch, ready }: { readonly batch: AiNewsBatch | null; readonly ready: boolean }) {
  const [state, action] = useActionState(generateAiNews, IDLE);
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
              defaultValue={batch?.operator_prompt ?? ''}
              placeholder="예: 이번 주는 뮤야얌 전자에 악재가 이어지다가 주말에 반전이 오면 좋겠어요. 시장 전체는 조용하게."
            />
            <FieldDescription>비워 두면 지금 흐름을 그대로 이어 갑니다. 적으면 그 방향으로, 단 흐름과 어긋나지 않게 만들어요.</FieldDescription>
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton disabled={!ready}>{batch ? '다시 5개 만들기' : '시나리오 5개 만들기'}</SubmitButton>
            <span className="text-xs text-muted-foreground">
              {ready ? '모델에 묻는 동안 1분 안팎 걸릴 수 있어요.' : '먼저 위에서 키를 저장해 주세요.'}
            </span>
          </div>
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

/**
 * One scenario, editable until it is decided. The operator settles the
 * lean, the strength, the hours and the text; the model's rationale stays
 * beside it as the reason it was proposed and never leaves this screen.
 */
export function ScenarioCard({ scenario }: { readonly scenario: AiNewsScenario }) {
  const [state, action] = useActionState(decideAiNewsScenario, IDLE);
  const open = scenario.status === 'proposed';
  const up = scenario.direction === 'up';
  const scope = scenario.symbol ? `${scenario.symbol} ${scenario.name ?? ''}`.trim() : '시장 전체';
  const id = scenario.id.slice(0, 8);

  return (
    <Card className={cn(!open && 'opacity-70')}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary">#{scenario.ordinal}</Badge>
          <span className="font-mono text-muted-foreground">{scope}</span>
          <Badge variant="outline" className={cn('font-bold', up ? 'border-rise text-rise' : 'border-fall text-fall')}>
            {up ? '▲ 호재' : '▼ 악재'} · {STRENGTHS.find((s) => s.value === scenario.strength)?.label ?? scenario.strength}
          </Badge>
          <Badge variant={scenario.status === 'published' ? 'default' : 'outline'}>{STATUS[scenario.status]}</Badge>
          {scenario.decided_at && <span className="text-muted-foreground">{formatMoment(scenario.decided_at)}</span>}
        </div>
        <CardTitle className="text-base">{scenario.headline}</CardTitle>
        {scenario.rationale && (
          <CardDescription className="[word-break:keep-all]">왜 지금: {scenario.rationale}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {open ? (
          <form action={action} className="grid gap-4">
            <input type="hidden" name="scenarioId" value={scenario.id} />
            <Field>
              <FieldLabel htmlFor={`headline-${id}`}>제목</FieldLabel>
              <Input id={`headline-${id}`} name="headline" defaultValue={scenario.headline} minLength={2} maxLength={120} required />
            </Field>
            <Field>
              <FieldLabel htmlFor={`body-${id}`}>본문</FieldLabel>
              <Textarea id={`body-${id}`} name="body" defaultValue={scenario.body} rows={4} maxLength={2000} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <fieldset className="grid gap-2">
                <legend className="text-sm font-bold">방향</legend>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border px-3 text-sm has-[:checked]:border-rise has-[:checked]:bg-rise/10">
                  <input type="radio" name="direction" value="up" defaultChecked={up} required /> 호재
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border px-3 text-sm has-[:checked]:border-fall has-[:checked]:bg-fall/10">
                  <input type="radio" name="direction" value="down" defaultChecked={!up} /> 악재
                </label>
              </fieldset>
              <fieldset className="grid gap-2">
                <legend className="text-sm font-bold">강도</legend>
                {STRENGTHS.map((strength) => (
                  <label
                    key={strength.value}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border px-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                    title={strength.detail}
                  >
                    <input type="radio" name="strength" value={strength.value} defaultChecked={strength.value === scenario.strength} />
                    {strength.label}
                  </label>
                ))}
              </fieldset>
              <Field>
                <FieldLabel htmlFor={`hours-${id}`}>기간 (시간)</FieldLabel>
                <Input id={`hours-${id}`} name="hours" type="number" inputMode="numeric" min={1} max={168} defaultValue={scenario.hours} required />
                <FieldDescription>1~168시간</FieldDescription>
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SubmitButton name="intent" value="publish">이 소식 발행</SubmitButton>
              <SubmitButton name="intent" value="discard" variant="outline">접어 두기</SubmitButton>
            </div>
            <ActionAlert state={state} />
          </form>
        ) : (
          <div className="grid gap-2 text-sm">
            {scenario.body && <p className="text-muted-foreground [word-break:keep-all]">{scenario.body}</p>}
            <p className="text-xs text-muted-foreground">{scenario.hours}시간 · 강도 {scenario.strength}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
