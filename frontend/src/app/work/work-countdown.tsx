'use client';

import { useEffect, useState } from 'react';
import { CardContent, CardFooter } from '@/components/ui/card';
import { SubmitTaskButton } from './work-forms';
import { durationLabel, secondsUntilSubmittable } from './work';

export function WorkCountdown({
  assignmentId,
  assignedAt,
  minimumDurationSeconds,
  initialSeconds,
}: {
  readonly assignmentId: string;
  readonly assignedAt: string;
  readonly minimumDurationSeconds: number;
  readonly initialSeconds: number;
}) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const update = () =>
      setSeconds(secondsUntilSubmittable(assignedAt, minimumDurationSeconds, Date.now()));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [assignedAt, minimumDurationSeconds]);

  const waiting = seconds > 0;
  return (
    <>
      <CardContent className="text-sm text-muted-foreground" aria-live="polite">
        <p>
          {waiting
            ? `최소 수행 시간이 ${durationLabel(seconds)} 남았어요.`
            : '최소 수행 시간을 채웠어요. 이제 제출할 수 있어요.'}
        </p>
      </CardContent>
      <CardFooter>
        <SubmitTaskButton
          assignmentId={assignmentId}
          disabled={waiting}
          label={waiting ? `${durationLabel(seconds)} 뒤 제출` : '작업 제출하기'}
        />
      </CardFooter>
    </>
  );
}
