'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { AlertOctagon, ArrowLeft } from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IDLE } from '@/lib/action-state';
import { lookupEmergencyTakedown, type TakedownLookupState } from './status-actions';
import { takedownStatusLabels } from './takedown-status';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { submitEmergencyTakedown } from './actions';

export default function EmergencyTakedownPage() {
  const { locale } = useLocale();
  const [state, formAction] = useActionState(submitEmergencyTakedown, IDLE);
  const [lookup, lookupAction] = useActionState(lookupEmergencyTakedown, { status: 'idle' } as TakedownLookupState);

  return (
    <div data-page="safety-takedown" className="mv-page grid gap-6 py-6 max-w-2xl mx-auto px-4">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 text-xs">
          <Link href="/safety" className="flex items-center gap-1">
            <ArrowLeft className="size-4" /> 안전 센터로 돌아가기
          </Link>
        </Button>
        <PageHeader
          eyebrow="EMERGENCY TAKEDOWN REQUEST"
          title={localeLabel(locale, '비회원 긴급 콘텐츠 삭제 요청', 'Emergency Content Takedown Request', '非会員緊急コンテンツ削除リクエスト', '非会员紧急内容删除申请', 'Yêu cầu gỡ bỏ nội dung khẩn cấp không cần tài khoản')}
        >
          본인 또는 미성년자의 동의 없이 게시된 사생활 침해, 성착취물, 협박 및 유해 콘텐츠의 긴급 삭제를 신청합니다.
        </PageHeader>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertOctagon className="size-5" />
            <CardTitle className="text-base font-semibold">신청서 작성</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            접수 후 관리자 검토 대기열로 전달됩니다. 실제 조치 여부와 처리 상태는 아래에서 조회할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <ActionAlert state={state} />

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="requesterEmail" className="block text-xs font-medium mb-1">
                  신청자 이메일 <span className="text-destructive">*</span>
                </label>
                <input
                  id="requesterEmail"
                  name="requesterEmail"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="requesterType" className="block text-xs font-medium mb-1">
                  신청자 자격 <span className="text-destructive">*</span>
                </label>
                <select
                  id="requesterType"
                  name="requesterType"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
                >
                  <option value="victim_self">피해 당사자 본인</option>
                  <option value="legal_guardian">법정대리인 (보호자/부모)</option>
                  <option value="authorized_rep">위임받은 법률 대리인</option>
                  <option value="third_party">제3자 공익 신고</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="reasonCategory" className="block text-xs font-medium mb-1">
                  침해/유해 사유 분류 <span className="text-destructive">*</span>
                </label>
                <select
                  id="reasonCategory"
                  name="reasonCategory"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
                >
                  <option value="non_consensual_private_image">비동의 사생활 사진/영상 노출</option>
                  <option value="underage_harmful_content">아동·청소년 유해/성착취물</option>
                  <option value="doxxing_credible_threat">신상 털기(Doxxing) 및 협박</option>
                  <option value="impersonation_account_takeover">사칭 및 계정 탈취</option>
                  <option value="harassment_stalking">악의적 지속 괴롭힘·스토킹</option>
                  <option value="illegal_content">기타 불법 유해 정보</option>
                </select>
              </div>

              <div>
                <label htmlFor="targetContentType" className="block text-xs font-medium mb-1">
                  대상 콘텐츠 유형 <span className="text-destructive">*</span>
                </label>
                <select
                  id="targetContentType"
                  name="targetContentType"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
                >
                  <option value="board_post">게시판 게시글</option>
                  <option value="board_comment">게시판 댓글</option>
                  <option value="gallery_photo">사진 갤러리 업로드</option>
                  <option value="chat_message">1:1 비공개 대화 메시지</option>
                  <option value="profile_bio">프로필 소개/닉네임</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="targetContentUrl" className="block text-xs font-medium mb-1">
                대상 콘텐츠 링크 (URL) <span className="text-destructive">*</span>
              </label>
              <input
                id="targetContentUrl"
                name="targetContentUrl"
                type="url"
                required
                placeholder="https://easy-scraping.com/board/post/123 또는 갤러리 링크"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-medium mb-1">
                상세 신고 내용 및 피해 설명 <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                minLength={10}
                placeholder="삭제가 필요한 구체적인 이유와 본인 확인에 필요한 참고 사항을 적어 주세요 (최소 10자 이상)."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="passcode" className="block text-xs font-medium mb-1">
                처리 상태 조회용 비밀번호 <span className="text-destructive">*</span>
              </label>
              <input
                id="passcode"
                name="passcode"
                type="password"
                required
                minLength={6}
                placeholder="6자리 이상 비밀번호 입력"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                추후 로그인 없이 접수 상태 및 조치 결과를 열람할 때 사용됩니다. <a href="#takedown-status" className="underline underline-offset-2">접수 상태 조회로 이동</a>
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <SubmitButton variant="destructive" className="min-h-11 px-5 text-sm font-semibold">
                긴급 콘텐츠 삭제 접수하기
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card id="takedown-status" className="border shadow-sm scroll-mt-20">
        <CardHeader>
          <CardTitle className="text-base font-semibold">접수 상태 조회</CardTitle>
          <CardDescription>로그인 없이 접수 번호와 접수 당시 설정한 비밀번호로 실제 처리 상태를 확인합니다. 비밀번호는 URL에 포함되지 않습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={lookupAction} autoComplete="off" className="grid gap-4">
            <div>
              <label htmlFor="lookupCaseId" className="mb-1 block text-sm font-medium">접수 번호</label>
              <input id="lookupCaseId" name="caseId" required minLength={5} maxLength={32} autoComplete="off"
                className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
            <div>
              <label htmlFor="lookupPasscode" className="mb-1 block text-sm font-medium">조회 비밀번호</label>
              <input id="lookupPasscode" name="passcode" type="password" required minLength={6} maxLength={64} autoComplete="off"
                className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
            <SubmitButton className="w-full sm:w-fit">처리 상태 확인</SubmitButton>
          </form>
          {lookup.status === 'error' ? <p role="alert" className="text-sm text-destructive">{lookup.message}</p> : null}
          {lookup.status === 'ok' && lookup.receipt ? (
            <section role="status" aria-live="polite" className="min-w-0 space-y-2 rounded-lg border p-4 text-sm">
              <h3 className="font-semibold">확인된 접수 상태</h3>
              <p className="break-all">접수 번호: {lookup.receipt.caseId}</p>
              <p>처리 상태: <strong>{takedownStatusLabels[lookup.receipt.status]}</strong></p>
              <p>접수 시각 (UTC): <time dateTime={lookup.receipt.createdAt}>{lookup.receipt.createdAt}</time></p>
              {lookup.receipt.actionedAt ? <p>조치 시각 (UTC): <time dateTime={lookup.receipt.actionedAt}>{lookup.receipt.actionedAt}</time></p> : null}
              <p className="text-xs text-muted-foreground">서버에 기록된 마지막 상태이며, 완료되지 않은 조치를 완료로 표시하지 않습니다.</p>
            </section>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
