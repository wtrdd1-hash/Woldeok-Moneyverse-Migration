import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDay, groupDigits } from '@/lib/money';
import type { ProfileView } from './profile';
import { jobLabel, nothingShown, titleLabel, visibilityLabel } from './profile';

/**
 * The parts of a profile that are worth rendering on their own.
 *
 * None of them is a client component: they hold no state and take no event,
 * so they render on the server with the page. They live here rather than
 * inside `page.tsx` because a page cannot be rendered in a test -- that needs
 * a live API and a database -- while these can, and what a withheld field
 * looks like is exactly the thing this feature is for.
 */

/** Nothing at all was written where a name should be. */
const NO_NAME = '이름 없는 회원';

export function displayName(profile: ProfileView): string {
  const name = profile.display_name?.trim();
  return name ? name : NO_NAME;
}

/**
 * The round image, or the first letter of the name.
 *
 * A plain `<img>`, not `next/image` and not the registry `Avatar`. The
 * optimiser would have to fetch a member-supplied address from this server,
 * and Radix's avatar only reveals the image after it has loaded in the
 * browser -- which would leave the picture missing from the server-rendered
 * HTML the rest of this product ships. `referrerPolicy` is the gallery's, for
 * the same reason: the host on the other end has no business learning which
 * member page linked to it.
 */
export function ProfileFigure({
  name,
  imageUrl,
}: {
  readonly name: string;
  readonly imageUrl: string | null;
}) {
  if (imageUrl === null) {
    return (
      <span
        aria-hidden
        className="grid size-16 shrink-0 place-items-center rounded-full border border-dashed bg-surface font-[family-name:var(--font-display)] text-2xl text-muted-foreground"
      >
        {[...name][0] ?? '?'}
      </span>
    );
  }
  return (
    <img
      src={imageUrl}
      alt={`${name} 프로필 이미지`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className="size-16 shrink-0 rounded-full border object-cover"
    />
  );
}

function Fact({ term, children }: { readonly term: string; readonly children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * One profile, on its owner's terms.
 *
 * `self` changes what a null means and therefore what is written, which is
 * the whole difference between the two screens. To the owner every field is
 * returned, so a null is "nothing here yet" and is said out loud. To anybody
 * else a null is either a withheld field or an empty one -- 080 answers the
 * same way for both, deliberately -- so the row is dropped and one honest
 * sentence at the foot covers all of them. Printing "비공개" per row would
 * claim to know which of the two it was.
 */
export function ProfileCard({
  profile,
  self,
}: {
  readonly profile: ProfileView;
  readonly self: boolean;
}) {
  const name = displayName(profile);
  const job = profile.job_type;
  const completions = profile.work_completions;
  // To the owner a missing field is still a row, because "아직 없어요" is
  // worth saying. To anybody else the row goes, and a card with no rows left
  // must not leave an empty block where the facts would have been.
  const showJob = job !== null || self;
  const showCompletions = completions !== null || self;
  const badge = profile.featured_title !== null || self;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <ProfileFigure name={name} imageUrl={profile.image_url} />
          <div className="grid gap-1.5">
            <CardTitle className="text-2xl">{name}</CardTitle>
            {badge && (
              <div className="flex flex-wrap items-center gap-2">
                {profile.featured_title !== null && (
                  <Badge variant="secondary">{titleLabel(profile.featured_title)}</Badge>
                )}
                {/* Only on one's own card. On somebody else's it is a setting
                    they did not choose to publish, and it tells the reader
                    nothing the page does not already show. */}
                {self && <Badge variant="outline">{visibilityLabel(profile.visibility)}</Badge>}
              </div>
            )}
            <CardDescription>
              <time dateTime={profile.joined_at}>{formatDay(profile.joined_at, '가입일 확인 중')}</time>
              부터 함께하고 있어요.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {(showJob || showCompletions) && (
        <CardContent>
          <dl className="grid gap-2 text-sm">
            {showJob && (
              <Fact term="직업">
                {job === null ? (
                  <span className="text-muted-foreground">아직 직업 기록이 없어요</span>
                ) : (
                  <>
                    {jobLabel(job)}
                    {profile.job_level !== null && (
                      <span className="tabular text-muted-foreground"> · {profile.job_level}레벨</span>
                    )}
                  </>
                )}
              </Fact>
            )}

            {showCompletions && (
              <Fact term="완료한 작업">
                {completions === null ? (
                  <span className="text-muted-foreground">아직 기록이 없어요</span>
                ) : (
                  // A count rather than money, but a bigint all the same, so
                  // it is grouped from the string and never passed through
                  // Number.
                  <>
                    <span className="tabular">{groupDigits(completions)}</span>회
                  </>
                )}
              </Fact>
            )}
          </dl>
        </CardContent>
      )}

      <CardFooter>
        {self ? (
          <p className="text-xs text-muted-foreground">
            여기 보이는 것은 나에게 보이는 전부예요. 다른 회원에게 어떤 항목까지 보여 줄지는 아래에서
            정할 수 있어요.
          </p>
        ) : nothingShown(profile) ? (
          <p className="text-xs text-muted-foreground">
            이 회원이 공개한 항목이 없어서 함께한 날짜만 보여요.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            이 회원이 공개하기로 한 항목만 보여요.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
