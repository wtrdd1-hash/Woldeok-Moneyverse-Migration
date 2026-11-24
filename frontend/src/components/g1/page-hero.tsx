import type { ReactNode } from 'react';
import { G1Scene, type G1SceneKind } from '@/components/g1/scene';

/**
 * The chamfered G1 page banner: the page's single h1, one sentence, an
 * optional slot (actions, a clock), and the decorative scene on the right.
 */
export function G1PageHero({
  title,
  lead,
  scene,
  danger = false,
  heading = 'h1',
  children,
}: {
  readonly title: ReactNode;
  readonly lead: ReactNode;
  readonly scene: G1SceneKind;
  readonly danger?: boolean;
  /** h2 when the page already carries its own h1 (the home page's locale h1). */
  readonly heading?: 'h1' | 'h2';
  readonly children?: ReactNode;
}) {
  const Heading = heading;
  return (
    <section
      className={`g1-chamfer relative isolate overflow-clip border ${
        danger ? 'border-[var(--g1-ember)] bg-[var(--g1-ember-wash)]' : 'border-[var(--g1-gold-deep)] bg-[linear-gradient(110deg,var(--g1-plum-3),var(--g1-plum)_55%,var(--g1-night))]'
      }`}
    >
      <div className="relative z-10 flex max-w-xl flex-col gap-3 p-6 sm:p-7">
        <Heading className="g1-display text-[34px] leading-tight text-[var(--g1-ink)] [text-shadow:0_2px_0_var(--g1-void)] sm:text-[44px]">{title}</Heading>
        <p className="max-w-[44ch] text-sm text-[var(--g1-muted)]">{lead}</p>
        {children}
      </div>
      <G1Scene kind={scene} className="pointer-events-none absolute bottom-0 right-0 -z-0 h-full w-[70%] opacity-90 sm:w-[60%]" />
    </section>
  );
}
