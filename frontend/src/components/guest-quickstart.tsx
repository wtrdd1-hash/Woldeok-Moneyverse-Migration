import Link from 'next/link';
import { ArrowRight, BookOpen, Calculator, Compass } from 'lucide-react';
import { TranslatedText as T } from '@/components/translated-text';
import { getGuestEntryPaths } from '@/lib/guest-entry-paths';
import type { Locale } from '@/lib/locale';

/**
 * First useful public action before registration.
 *
 * Deliberately contains no client-side reward, login-success claim, fake
 * signup event, analytics cookie, or representation of WLD as cash.
 */
export function GuestQuickstart({ locale }: { readonly locale: Locale }) {
  const paths = getGuestEntryPaths(locale);

  return (
    <section
      aria-labelledby="guest-quickstart-heading"
      className="rounded-3xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-card to-card p-5 sm:p-6"
      data-testid="guest-quickstart"
    >
      <p className="mb-2 text-xs font-semibold tracking-wide text-emerald-400">
        <T korean="가입 없이 시작" english="Try before you sign up" japanese="登録せずに体験" chinese="无需注册，先体验" />
      </p>
      <h2 id="guest-quickstart-heading" className="text-lg sm:text-xl font-bold text-foreground">
        <T
          korean="먼저 하나를 직접 체험해 보세요"
          english="See how it works before creating an account"
          japanese="アカウント作成前に体験してみましょう"
          chinese="注册账户前，先亲自体验"
        />
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        <T
          korean="금융 계산기와 경제 용어는 로그인 없이 볼 수 있습니다. WLD는 실제 현금이나 금융상품이 아닌 게임 재화입니다."
          english="Explore finance tools and definitions without signing in. WLD is fictional game currency, not cash or an investment."
          japanese="金融計算機や用語解説はログイン不要です。WLDは現金や金融商品ではなくゲーム内通貨です。"
          chinese="无需登录即可使用金融计算器和阅读金融术语。WLD是游戏内虚拟货币，不是真实现金或投资产品。"
        />
      </p>
      <nav aria-labelledby="guest-quickstart-heading" className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link
          href={paths.calculator}
          data-guest-entry="calculator"
          className="group flex min-h-16 items-center gap-3 rounded-2xl border border-border/80 bg-background/90 p-3 hover:border-emerald-500/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          <Calculator aria-hidden="true" className="size-5 shrink-0 text-emerald-500" />
          <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
            <T korean="복리 계산 직접 해보기" english="Try a compound calculator" japanese="複利を計算する" chinese="试用复利计算器" />
          </span>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5" />
        </Link>
        <Link
          href={paths.glossary}
          data-guest-entry="glossary"
          className="group flex min-h-16 items-center gap-3 rounded-2xl border border-border/80 bg-background/90 p-3 hover:border-emerald-500/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          <BookOpen aria-hidden="true" className="size-5 shrink-0 text-emerald-500" />
          <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
            <T korean="경제 용어부터 배우기" english="Learn finance terms" japanese="金融用語を学ぶ" chinese="学习金融术语" />
          </span>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5" />
        </Link>
        <Link
          href={paths.features}
          data-guest-entry="features"
          className="group flex min-h-16 items-center gap-3 rounded-2xl border border-border/80 bg-background/90 p-3 hover:border-emerald-500/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          <Compass aria-hidden="true" className="size-5 shrink-0 text-emerald-500" />
          <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
            <T korean="가상경제 기능 알아보기" english="Explore the fictional economy" japanese="仮想経済の機能を見る" chinese="了解虚拟经济玩法" />
          </span>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5" />
        </Link>
      </nav>
    </section>
  );
}
