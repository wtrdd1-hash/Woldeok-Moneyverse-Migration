'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { useViewer } from '@/lib/use-viewer';
import { NewPostForm } from './board-forms';

export function BoardParticipation() {
  const viewer = useViewer();

  if (viewer?.signedIn && viewer.consentCurrent) return <NewPostForm />;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm text-muted-foreground">
        <span>읽기는 자유롭게, 참여는 회원으로.</span>
        <Link href="/login" className="font-bold text-foreground underline underline-offset-4">
          로그인하고 글쓰기
        </Link>
      </CardContent>
    </Card>
  );
}
