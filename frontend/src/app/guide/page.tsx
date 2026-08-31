import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FIRST_DAY_ORDER, GUIDE_STEPS } from './guide';

/**
 * How to start, on one page.
 *
 * Public and indexable on purpose. It is the one screen that explains what
 * this site is to somebody who has not signed in, and section 18.2 of the
 * specification puts a guide in the 공개 정보 class — 색인 허용, sitemap 포함.
 * It is also the only page here with substantial prose that names no member
 * and no balance, which is what makes it safe to index at all.
 *
 * Static. Nothing on it is per-member, so it renders once and is cached.
 */
export const metadata: Metadata = {
  title: '이용 방법',
  description:
    '월덕 머니버스를 처음 시작하는 방법. 로그인과 이용 동의부터 첫 작업 보상을 확인하기까지 여섯 단계.',
  alternates: { canonical: '/guide' },
};

export default function GuidePage() {
  return (
    <div className="grid gap-8">
      <PageHeader eyebrow="GETTING STARTED" title="첫 활동은 이렇게 시작하세요">
        처음 로그인했다면 아래 순서대로 한 번만 따라 해 보세요. 여기 나오는 WLD와 보상은 모두 게임
        안에서만 쓰는 가상 데이터이고, 현금으로 바꾸거나 실물 경품을 받을 수는 없습니다.
      </PageHeader>

      <ol className="grid gap-4">
        {GUIDE_STEPS.map((step, index) => (
          <li key={step.id}>
            <Card>
              <CardHeader>
                <CardDescription className="tabular">{index + 1}단계</CardDescription>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {step.body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className="max-w-prose text-sm leading-[1.8] text-muted-foreground [word-break:keep-all]"
                  >
                    {paragraph}
                  </p>
                ))}

                {step.points && (
                  <ul className="grid gap-1 text-sm text-muted-foreground">
                    {step.points.map((point) => (
                      <li key={point} className="flex gap-2 [word-break:keep-all]">
                        <span aria-hidden className="text-forest-soft">
                          ·
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                )}

                {step.link && (
                  <Button asChild variant="outline" className="w-fit">
                    <Link href={step.link.href}>{step.link.label} →</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      <section aria-labelledby="order-title" className="grid gap-3">
        <h2 id="order-title" className="text-lg">
          첫날 추천 순서
        </h2>
        <Card>
          <CardContent>
            <ol className="grid gap-2 text-sm">
              {FIRST_DAY_ORDER.map((entry, index) => (
                <li key={entry} className="flex gap-3 [word-break:keep-all]">
                  <span className="tabular text-muted-foreground">{index + 1}.</span>
                  {entry}
                </li>
              ))}
            </ol>
            <p className="mt-4 max-w-prose text-sm leading-[1.8] text-muted-foreground [word-break:keep-all]">
              첫날에는 여러 작업을 한꺼번에 맡기보다, 퀘스트나 작업 하나를 끝까지 마치고 보상이
              어떻게 기록되는지 확인해 보시길 권합니다.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
